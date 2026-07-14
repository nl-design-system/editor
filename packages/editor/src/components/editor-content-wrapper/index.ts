import { safeCustomElement } from '@nl-design-system-community/clippy-components/lib/decorators';
import { html, LitElement } from 'lit';
import contentWrapperStyles from './styles';

const tag = 'clippy-editor-content-wrapper';

declare global {
  interface HTMLElementTagNameMap {
    [tag]: EditorContentWrapper;
  }
}

/**
 * Wraps the editor toolbar and editable content area into a single column so it
 * can be laid out beside the validations drawer by `clippy-editor-wrapper`.
 *
 * @tag clippy-editor-content-wrapper
 *
 * @slot - The toolbar and the editor container.
 */
@safeCustomElement(tag)
export class EditorContentWrapper extends LitElement {
  static override readonly styles = contentWrapperStyles;

  override render() {
    return html`<slot></slot>`;
  }
}
