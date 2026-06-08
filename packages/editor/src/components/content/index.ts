import { consume } from '@lit/context';
import { safeCustomElement } from '@nl-design-system-community/clippy-components/lib/decorators';
import { Editor as TiptapEditor } from '@tiptap/core';
import { LitElement, css, html, nothing, type PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import type { ValidationsMap } from '@/types/validation.ts';
import { htmlDocumentContext } from '@/context/htmlDocumentContext.ts';
import { tiptapContext } from '@/context/tiptapContext.ts';
import { validationsContext } from '@/context/validationsContext.ts';

const tag = 'clippy-content';

declare global {
  interface HTMLElementTagNameMap {
    [tag]: Content;
  }
}

/**
 * The editable content area of the rich text editor. It is a separate element
 * so consumers can decide where it appears in the page layout.
 *
 * By default the TipTap `ProseMirror` DOM is mounted directly into the Light DOM
 * of this element so that standard browser stylesheets apply. Pass the `shadow`
 * attribute to mount inside the Shadow DOM instead (experimental).
 *
 * The element requires a TipTap editor context (provided by `<clippy-editor>`)
 * to be present in an ancestor.
 *
 * @element clippy-content
 *
 * @example Light DOM (default)
 * ```html
 * <clippy-content></clippy-content>
 * ```
 *
 * @example Shadow DOM
 * ```html
 * <clippy-content shadow></clippy-content>
 * ```
 */
@safeCustomElement(tag)
export class Content extends LitElement {
  static override readonly styles = [
    css`
      :host,
      .inline,
      .inline .ProseMirror,
      .inline .ProseMirror > * {
        display: inline;
      }
    `,
  ];
  /** @internal TipTap editor instance consumed from context. */
  @consume({ context: tiptapContext, subscribe: true })
  @property({ attribute: false })
  public editor?: TiptapEditor;

  /** @internal Serialised HTML document for read-only rendering, consumed from context. */
  @consume({ context: htmlDocumentContext, subscribe: true })
  @property({ attribute: false })
  public htmlDocument?: HTMLElement;

  /** @internal Validations map consumed from context (used for reactive updates). */
  @consume({ context: validationsContext, subscribe: true })
  @property({ attribute: false })
  validationsContext?: ValidationsMap;

  /**
   * When present, mounts the ProseMirror view inside the Shadow DOM instead of
   * the Light DOM. Experimental — use with care.
   */
  @property({ attribute: true })
  public shadow?: boolean;

  /**
   * When `true`, the host element and its ProseMirror children are rendered as
   * `display: inline` so the editor can be embedded inside flowing text.
   */
  @property({ attribute: true, type: Boolean })
  public inline?: boolean;

  /**
   * Synchronous guard preventing double-mount within a single Lit update cycle.
   * `editor.isInitialized` cannot be used here because it is set asynchronously
   * inside a `setTimeout` after the `create` event fires — both `firstUpdated()`
   * and `updated()` would therefore see it as `false` in the same tick and both
   * call `editor.mount()`, producing a second contenteditable div.
   */
  #editorMounted = false;

  override connectedCallback(): void {
    super.connectedCallback();
    this.style.position = 'relative';
    this.style.display = 'block';
  }

  override disconnectedCallback() {
    this.editor?.destroy();
    this.#editorMounted = false;
    super.disconnectedCallback();
  }

  override firstUpdated(): void {
    const el = this.shadow ? this.shadowRoot?.firstElementChild : this;
    if (el && this.editor && !this.#editorMounted) {
      this.#editorMounted = true;
      this.editor.mount(el);
    }
  }

  override updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);
    // Handle the case where the TipTap editor context arrives after firstUpdated()
    // (e.g. when clippy-content is used standalone inside clippy-context).
    if (changedProperties.has('editor') && this.editor && !this.#editorMounted) {
      const el = this.shadow ? this.shadowRoot?.firstElementChild : this;
      if (el) {
        this.#editorMounted = true;
        this.editor.mount(el);
      }
    }
  }

  override render() {
    const isReadonly = !this.editor && !!this.htmlDocument;

    if (this.shadow) {
      return html`<div class=${this.inline ? 'inline' : nothing}>
        ${isReadonly ? unsafeHTML(this.htmlDocument!.innerHTML) : html`<slot></slot>`}
      </div>`;
    }

    if (isReadonly) {
      return html`${unsafeHTML(this.htmlDocument!.innerHTML)}`;
    }

    return null;
  }
  protected override createRenderRoot() {
    return this.shadow ? super.createRenderRoot() : this;
  }
}
