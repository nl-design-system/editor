import { HEADING_LEVELS, contentClasses, headingClasses } from '@nl-design-system-community/editor/content-classes';
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

/**
 * Adds the shared NLDS content classes to CKEditor's output, so a CKEditor build renders the same markup
 * as the Tiptap editor.
 */

// Nodes that are real elements in the CKEditor model (class them directly in the insert event)
const MODEL_ELEMENT_CLASSES: Record<string, string> = {
  blockQuote: contentClasses.blockquote,
  codeBlock: contentClasses.codeBlock,
  imageBlock: contentClasses.image,
  imageInline: contentClasses.image,
  paragraph: contentClasses.paragraph,
  table: contentClasses.table,
};

// Heading model names are configurable and don't imply a level: CKEditor renders `heading1` as `<h2>` by
// default. So hook these names, but take the level from the tag that was actually rendered.
const HEADING_MODEL_NAMES = HEADING_LEVELS.map((level) => `heading${level}`);

const headingClassesForTag = (tagName: string): string | undefined => {
  const level = /^h([1-6])$/.exec(tagName)?.[1];
  return level ? headingClasses(Number(level)) : undefined;
};

// Lists have no model element; CKEditor builds the `<ul>`/`<ol>` from a `listType` value instead.
const LIST_TYPE_CLASSES: Record<string, string> = {
  bulleted: contentClasses.bulletList,
  numbered: contentClasses.orderedList,
};

export class NldsContentClasses extends Plugin {
  static get pluginName() {
    return 'NldsContentClasses' as const;
  }

  init(): void {
    // Must run in init(): the list feature reads its rules in afterInit()
    this._classElementModeledNodes();
    this._classLists();
  }

  // Wait for CKEditor to create the element, then add our class to it.
  private _classElementModeledNodes(): void {
    // Apply classes in the downcast conversion, which turns the model into the (HTML) view
    this.editor.conversion.for('downcast').add((dispatcher: DowncastDispatcher) => {
      for (const modelName of [...Object.keys(MODEL_ELEMENT_CLASSES), ...HEADING_MODEL_NAMES]) {
        dispatcher.on<DowncastInsertEvent>(
          `insert:${modelName}`,
          (_evt: EventInfo, data, conversionApi: DowncastConversionApi) => {
            const viewElement = conversionApi.mapper.toViewElement(data.item as ModelElement);
            if (!viewElement) {
              return;
            }
            const classes = MODEL_ELEMENT_CLASSES[modelName] ?? headingClassesForTag(viewElement.name);
            if (classes) {
              conversionApi.writer.addClass(classes.split(' '), viewElement);
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
      setAttributeOnDowncast(writer: ViewDowncastWriter, value: unknown, element: ViewElement) {
        const classes = typeof value === 'string' ? LIST_TYPE_CLASSES[value] : undefined;
        if (classes) {
          writer.addClass(classes.split(' '), element);
        }
      },
    };
    listEditing.registerDowncastStrategy(strategy);
  }
}
