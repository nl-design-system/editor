import { consume } from '@lit/context';
import { Editor as TiptapEditor } from '@tiptap/core';
import { LitElement, css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { ValidationsMap } from '@/types/validation.ts';
import { tiptapContext } from '@/context/tiptapContext.ts';
import { validationsContext } from '@/context/validationsContext.ts';

const tag = 'clippy-content';

declare global {
  interface HTMLElementTagNameMap {
    [tag]: Content;
  }
}

/**
 * The editable content of the rich text editor. It is a separate element, so you can decide
 * where it goes in your user interface.
 *
 * Decide if you want to render in the Shadow DOM or not. This feature is available
 * to experiment, and find out the pro's and cons. The default is Light DOM rendering.
 *
 *     <clippy-content shadow><clippy-content>
 *
 * The element requires to have the context of an editor instance, so it must always
 * be rendered somewhere inside a <clippy-editor> element.
 */
@customElement(tag)
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
  @consume({ context: tiptapContext, subscribe: true })
  @property({ attribute: false })
  public editor?: TiptapEditor;

  @consume({ context: validationsContext, subscribe: true })
  @property({ attribute: false })
  validationsContext?: ValidationsMap;

  @property({ attribute: true })
  public shadow?: boolean;

  @property({ attribute: true, type: Boolean })
  public inline?: boolean;

  override connectedCallback(): void {
    super.connectedCallback();
    this.style.position = 'relative';
  }

  override disconnectedCallback() {
    this.editor?.destroy();
    super.disconnectedCallback();
  }

  override firstUpdated(): void {
    const el = this.shadow ? this.shadowRoot?.firstElementChild : this;
    if (el) {
      this.editor?.mount(el);
    }
  }
  override render() {
    if (this.shadow) {
      return html`<div class=${this.inline ? 'inline' : nothing}><slot></slot></div>`;
    } else return null;
  }
  protected override createRenderRoot() {
    return this.shadow ? super.createRenderRoot() : this;
  }
}
