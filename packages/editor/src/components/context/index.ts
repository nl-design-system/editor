import { ContextProvider, provide } from '@lit/context';
import { Editor as TiptapEditor } from '@tiptap/core';
import { LitElement, html, type PropertyValues } from 'lit';
import { property, queryAssignedElements } from 'lit/decorators.js';
import type { ValidationResult } from '@/types/validation.ts';
import { htmlDocumentContext } from '@/context/htmlDocumentContext.ts';
import { identifierContext } from '@/context/identifierContext.ts';
import { tiptapContext } from '@/context/tiptapContext.ts';
import { validationsContext } from '@/context/validationsContext.ts';
import { safeCustomElement } from '@/decorators/SafeCustomElementDecorator.ts';
import { CustomEvents } from '@/events';
import { editorExtensions } from '@/extensions';
import { initializeLocale } from '@/localization.ts';
import { sanitizeTopHeadingLevel } from '@/utils/sanitize.ts';
import { debouncedValidate, runValidation } from '@/validators';
import { editorContextStyles } from './styles.ts';

const tag = 'clippy-context';

/** Tracks all active identifier values to enforce uniqueness across instances. */
const registeredIdentifiers = new Set<string>();

declare global {
  interface HTMLElementTagNameMap {
    [tag]: Context;
  }
}

/**
 * Make rich text content editable with this element.
 * Put the rich text content inside the `content` slot.
 * Use other custom elements from our collection to create your own rich text editor.
 *
 * A very minimal example:
 *
 *     <clippy-editor>
 *       <!-- This content is the source -->
 *       <div slot=""><h1>Page title</h1></div>
 *       <!-- This is the editable rendering the content above -->
 *       <clippy-content></clippy-content>
 *     </clippy-editor>
 */
@safeCustomElement(tag)
export class Context extends LitElement {
  static override readonly styles = editorContextStyles;

  @provide({ context: identifierContext })
  @property({ reflect: true, type: String })
  override id = 'clippy-editor-id';

  @property({ attribute: 'top-heading-level', reflect: true, type: Number })
  topHeadingLevel = 1;

  @property({
    attribute: 'enable-rules',
    converter: {
      fromAttribute: (value: string) => {
        return value.split(/\s+/g);
      },
      toAttribute: (value: string[]) => {
        return value.join(' ');
      },
    },
    reflect: true,
  })
  enableRules: string[] = ['*'];

  @property({
    attribute: 'disable-rules',
    converter: {
      fromAttribute: (value: string) => {
        return value.split(/\s+/g);
      },
      toAttribute: (value: string[]) => {
        return value.join(' ');
      },
    },
    reflect: true,
  })
  disableRules: string[] = [];

  @property({ attribute: 'readonly', reflect: true, type: Boolean })
  readonly = false;

  @queryAssignedElements({ flatten: true, slot: 'value' })
  contentSlot!: HTMLElement[];

  @provide({ context: validationsContext })
  validationsContext = new Map();

  // create a provider for the whole document body.
  // https://lit.dev/docs/data/context/
  // https://github.com/lit/lit/blob/main/packages/context/README.md
  lightValidationsContext = new ContextProvider(document.body, {
    context: validationsContext,
    initialValue: new Map(),
  });

  updateValidationsContext = (resultMap: Map<Range, ValidationResult>): void => {
    this.validationsContext = resultMap;
    this.lightValidationsContext.setValue(this.validationsContext);
  };

  @provide({ context: tiptapContext })
  editor?: TiptapEditor;

  @provide({ context: htmlDocumentContext })
  htmlDocumentElement?: HTMLElement;

  protected get editorSettings() {
    return {
      disableRules: this.disableRules,
      enableRules: this.enableRules,
      readonly: this.readonly,
      topHeadingLevel: sanitizeTopHeadingLevel(this.topHeadingLevel),
    };
  }

  protected createEditor(): void {
    const content = this.contentSlot.find((el) => el instanceof HTMLDivElement)?.innerHTML || '';
    this.editor = new TiptapEditor({
      content,
      editable: !this.readonly,
      editorProps: {
        attributes: {
          class: 'clippy-content',
        },
      },
      // Prevent auto-mounting during SSR; Content component calls moumountnt() client-side
      element: null,
      extensions: editorExtensions(this.editorSettings, this.updateValidationsContext, this.id),
    });
  }

  override firstUpdated(): void {
    if (registeredIdentifiers.has(this.id)) {
      throw new Error(
        `[clippy-context] Duplicate identifier detected: "${this.id}". Each <clippy-context> must have a unique identifier.`,
      );
    }
    registeredIdentifiers.add(this.id);
    this.htmlDocumentElement = this.contentSlot.find((el) => el instanceof HTMLDivElement);

    if (this.readonly) {
      // In readonly mode, skip TipTap entirely and validate the slot DOM directly.
      if (this.htmlDocumentElement) {
        runValidation(this.htmlDocumentElement, this.editorSettings, this.updateValidationsContext);
      }
    } else {
      // Non-readonly: create the TipTap editor (clippy-editor enables the
      // Validation extension via _includeValidationExtension).
      this.createEditor();
    }
  }

  override updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);
    if (changedProperties.has('readonly') && this.editor) {
      this.editor.setEditable(!this.readonly);
    }
  }

  private isLocaleInitialized = false;

  /**
   * Re-validate the document DOM after a corrector has mutated it.
   * This is only needed in readonly (non-TipTap) mode — TipTap handles
   * re-validation via its own `onUpdate` extension hook.
   */
  readonly #handleCorrectionInReadonly = () => {
    if (this.readonly && this.htmlDocumentElement) {
      debouncedValidate(this.htmlDocumentElement, this.editorSettings, this.updateValidationsContext);
    }
  };

  override connectedCallback() {
    super.connectedCallback();
    this.lightValidationsContext.hostConnected();
    globalThis.addEventListener(CustomEvents.CORRECT_VALIDATION_ISSUE, this.#handleCorrectionInReadonly);
    if (!this.isLocaleInitialized) {
      this.isLocaleInitialized = true;
      initializeLocale().then(() => {
        this.requestUpdate();
      });
    }
    // Find custom elements that are already defined, and might have dispatched the `context-request` event already
    const isCustomElement = (x: Element) => /-/.test(x.localName);
    Array.from(this.querySelectorAll(':defined'))
      .filter((x) => isCustomElement(x))
      .forEach((x) => {
        // "Have you tried turning it off and on again?"
        // Detach and re-attach the node from the tree, to trigger the `ContextConsumer` emitting a new `context-request` event
        const nextSibling = x.nextSibling;
        const parentNode = x.parentNode;
        parentNode?.removeChild(x);
        parentNode?.insertBefore(x, nextSibling);
      });
  }

  override disconnectedCallback() {
    registeredIdentifiers.delete(this.id);
    this.htmlDocumentElement = undefined;
    this.editor?.destroy();
    globalThis.removeEventListener(CustomEvents.CORRECT_VALIDATION_ISSUE, this.#handleCorrectionInReadonly);
    super.disconnectedCallback();
  }

  override render() {
    return html` <slot name="value" hidden></slot><slot></slot>`;
  }
}
