import { ContextProvider, provide } from '@lit/context';
import { safeCustomElement } from '@nl-design-system-community/clippy-components/lib/decorators';
import { Editor as TiptapEditor } from '@tiptap/core';
import { LitElement, html, type PropertyValues } from 'lit';
import { property, queryAssignedElements } from 'lit/decorators.js';
import type { ValidationResult } from '@/types/validation.ts';
import { htmlDocumentContext } from '@/context/htmlDocumentContext.ts';
import { identifierContext } from '@/context/identifierContext.ts';
import { tiptapContext } from '@/context/tiptapContext.ts';
import { validationsContext } from '@/context/validationsContext.ts';
import { editorExtensions } from '@/extensions';
import { initializeLocale } from '@/localization.ts';
import { sanitizeTopHeadingLevel } from '@/utils/sanitize.ts';
import { waitForMedia } from '@/utils/waitForMedia.ts';
import { runValidation } from '@/validators';
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
 * Context provider that powers the rich text editor. Sets up the TipTap editor
 * instance, runs accessibility validations, and distributes state to child
 * components via Lit context.
 *
 * Use `<clippy-editor>` for the full-featured editor, or compose your own UI by
 * placing `<clippy-context>` directly and adding `<clippy-content>` and any
 * other public components as children.
 *
 * @element clippy-context
 *
 * @slot value - Place a `<div>` with your initial HTML content here. The slot
 *   is hidden from the user; it is only read by the editor on first render.
 * @slot - Default slot for child components such as `<clippy-content>`,
 *   `<clippy-toolbar>`, `<clippy-validations-gutter>`, etc.
 *
 * @example
 * ```html
 * <clippy-context id="my-editor">
 *   <div slot="value"><p>Hello world</p></div>
 *   <clippy-toolbar></clippy-toolbar>
 *   <clippy-content></clippy-content>
 * </clippy-context>
 * ```
 */
@safeCustomElement(tag)
export class Context extends LitElement {
  static override readonly styles = editorContextStyles;

  /**
   * Unique identifier for this editor instance. Reflected as the host element's
   * `id` attribute and used to scope validation events across multiple editors
   * on the same page.
   */
  @provide({ context: identifierContext })
  @property({ reflect: true, type: String })
  override id = 'clippy-editor-id';

  /**
   * The highest heading level allowed in the document (1–6).
   * Heading levels below this value are removed from the format-select options.
   * Reflected as `top-heading-level`.
   * @default 1
   */
  @property({ attribute: 'top-heading-level', reflect: true, type: Number })
  topHeadingLevel = 1;

  /**
   * Space-separated list of validation rule keys to enable.
   * Use `'*'` (the default) to enable all rules.
   * Reflected as `enable-rules`.
   * @default ['*']
   */
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

  /**
   * Space-separated list of validation rule keys to disable.
   * Takes precedence over `enable-rules`.
   * Reflected as `disable-rules`.
   * @default []
   */
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

  /**
   * When `true`, the editor is rendered in read-only mode. TipTap is not
   * initialised; accessibility validations are still run against the slot DOM.
   * Reflected as the `readonly` attribute.
   * @default false
   */
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
      // In readonly mode, skip TipTap entirely and validate the rendered content.
      // We defer to the next animation frame so that clippy-content has had a chance
      // to render its visible copy of the HTML via unsafeHTML(). Validating against
      // the hidden slot element (htmlDocumentElement) produces Range objects whose
      // getBoundingClientRect() returns zeros, making gutter indicators invisible.
      requestAnimationFrame(() => {
        const contentEl = this.querySelector('clippy-content') as HTMLElement | null;
        const targetEl = contentEl ?? this.htmlDocumentElement;
        if (!targetEl) return;

        // Media elements affect layout dimensions and therefore Range bounding
        // rects. Wait for every media element inside the target to settle before
        // computing indicator positions.
        const mediaEls = [...targetEl.querySelectorAll('img, video, audio')];

        Promise.all(mediaEls.map((el) => waitForMedia(el))).then(() => {
          runValidation(targetEl, this.editorSettings, this.updateValidationsContext);
        });
      });
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

  override connectedCallback() {
    super.connectedCallback();
    this.lightValidationsContext.hostConnected();
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
    super.disconnectedCallback();
  }

  override render() {
    return html` <slot name="value" hidden></slot><slot></slot>`;
  }
}
