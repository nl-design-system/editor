import {
  Plugin,
  type DowncastConversionApi,
  type DowncastDispatcher,
  type DowncastInsertEvent,
  type EventInfo,
  type ListAttributeDowncastStrategy,
  type ListEditing,
  type ModelElement,
  type ViewDowncastWriter,
  type ViewElement,
} from 'ckeditor5';
import {
  CONTENT_CLASS_FIELDS,
  contentClassNames,
  resolveContentClasses,
  type ContentClassKey,
  type ContentClassesConfig,
} from './content-classes-config.ts';

/**
 * Adds the shared content classes to CKEditor's output, so a CKEditor build renders the same markup
 * as the Tiptap editor. The defaults come from the NL Design System; a host (Drupal, TYPO3, ...) can
 * override any class through the ContentClassesConfig.
 */
declare module 'ckeditor5' {
  interface EditorConfig {
    contentClasses?: ContentClassesConfig;
  }
}

// Nodes that are real elements in the CKEditor model (class them directly in the insert event)
const MODEL_ELEMENT_KEYS = new Map<string, ContentClassKey>(
  CONTENT_CLASS_FIELDS.flatMap(({ key, modelElements }) =>
    modelElements.map((modelElement): [string, ContentClassKey] => [modelElement, key]),
  ),
);

// Lists have no model element; CKEditor builds the `<ul>`/`<ol>` from a `listType` value instead.
const LIST_TYPE_KEYS = new Map<string, ContentClassKey>(
  CONTENT_CLASS_FIELDS.flatMap(({ key, listTypes }) =>
    listTypes.map((listType): [string, ContentClassKey] => [listType, key]),
  ),
);

const DEFAULT_CLASSES = resolveContentClasses();

export class ContentClasses extends Plugin {
  static get pluginName() {
    return 'ContentClasses' as const;
  }

  private _classes: Record<ContentClassKey, string> = resolveContentClasses();

  init(): void {
    this._classes = resolveContentClasses(this.editor.config.get('contentClasses'));

    // Must run in init(): the list feature reads its rules in afterInit()
    this._classElementModeledNodes();
    this._classLists();
  }

  // Writes the configured class, clearing the default it replaces.
  private _writeClass(writer: ViewDowncastWriter, element: ViewElement, key: ContentClassKey): void {
    // The class names to end up with. `element.name` is the rendered tag, which resolves `{level}` on headings.
    const classNames = contentClassNames(this._classes[key], element.name);
    // Default classes to clean up, in case plugin config overrides them.
    const stale = contentClassNames(DEFAULT_CLASSES[key], element.name);

    if (stale.length) {
      writer.removeClass(stale, element);
    }

    if (classNames.length) {
      writer.addClass(classNames, element);
    }
  }

  // Wait for CKEditor to create the element, then add our class to it.
  private _classElementModeledNodes(): void {
    // Apply classes in the downcast conversion, which turns the model into the (HTML) view
    this.editor.conversion.for('downcast').add((dispatcher: DowncastDispatcher) => {
      for (const [modelName, key] of MODEL_ELEMENT_KEYS) {
        dispatcher.on<DowncastInsertEvent>(
          `insert:${modelName}`,
          (_evt: EventInfo, data, conversionApi: DowncastConversionApi) => {
            const viewElement = conversionApi.mapper.toViewElement(data.item as ModelElement);
            if (viewElement) {
              // The rendered tag decides the heading level: CKEditor renders `heading1` as `<h2>`.
              this._writeClass(conversionApi.writer, viewElement, key);
            }
          },
          // Low, so we run after CKEditor has built the element.
          { priority: 'low' },
        );
      }
    });
  }

  // There is no list element in the model to hook. This extends the list feature with an extra rule:
  // "when you build the `<ul>`/`<ol>`, also add this class".
  private _classLists(): void {
    if (!this.editor.plugins.has('ListEditing')) {
      // lists are not available in the CKEditor instance
      return;
    }

    const listEditing = this.editor.plugins.get('ListEditing') as ListEditing;
    const strategy: ListAttributeDowncastStrategy = {
      attributeName: 'listType',
      // An addition, not a replacement: CKEditor still builds the `<ul>`/`<ol>` itself.
      consume: false,
      scope: 'list',
      setAttributeOnDowncast: (writer: ViewDowncastWriter, value: unknown, element: ViewElement) => {
        const key = typeof value === 'string' ? LIST_TYPE_KEYS.get(value) : undefined;
        if (key) {
          this._writeClass(writer, element, key);
        }
      },
    };
    listEditing.registerDowncastStrategy(strategy);
  }
}
