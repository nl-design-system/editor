import { safeCustomElement } from '@nl-design-system-community/clippy-components/lib/decorators';
import { Editor as TiptapEditor } from '@tiptap/core';
import { LitElement, css, html, nothing, type PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

const tag = 'clippy-content';

/**
 * Padding for the editable area. Because the ProseMirror view (class
 * `clippy-content`) is mounted in Light DOM, this rule has to live in the same
 * tree as the editable, the shadow root of `<clippy-editor>`.
 * It is therefore adopted into `getRootNode()` at connect time rather than
 * declared in a shadow stylesheet that cannot reach slotted content.
 */
const CONTENT_PADDING_CSS = css`
  .clippy-content {
    padding-block: var(--basis-space-inline-4xl);
    padding-inline: var(--basis-space-inline-4xl);
  }
`;

const contentPaddingSheet = new CSSStyleSheet();
contentPaddingSheet.replaceSync(CONTENT_PADDING_CSS.cssText);

/** Adopt the editable-padding stylesheet into a root once. */
function ensureContentPadding(root: Document | ShadowRoot): void {
  if (!root.adoptedStyleSheets.includes(contentPaddingSheet)) {
    root.adoptedStyleSheets = [...root.adoptedStyleSheets, contentPaddingSheet];
  }
}

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
 * `<clippy-editor>` passes it the TipTap editor instance as its `editor` property.
 *
 * @tag clippy-content
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
  /** @internal TipTap editor instance, passed by `<clippy-editor>`. */
  @property({ attribute: false })
  public editor?: TiptapEditor;

  /** @internal Serialised HTML document for read-only rendering, passed by `<clippy-editor>`. */
  @property({ attribute: false })
  public htmlDocument?: HTMLElement;

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

    // The editable is Light DOM, so its padding must be adopted into its own root.
    if (!this.shadow && !this.inline) {
      const root = this.getRootNode();
      if (root instanceof Document || root instanceof ShadowRoot) {
        ensureContentPadding(root);
      }
    }
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
    // Handle the case where the TipTap editor arrives after firstUpdated().
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
