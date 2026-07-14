import { safeCustomElement } from '@nl-design-system-community/clippy-components/lib/decorators';
import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import wrapperStyles from './styles';

const tag = 'clippy-editor-wrapper';

export type DrawerPosition = 'left' | 'right';

declare global {
  interface HTMLElementTagNameMap {
    [tag]: EditorWrapper;
  }
}

/**
 * Flex layout wrapper that arranges the editor content and the validations drawer
 * side by side. The `drawer-position` attribute controls which side the drawer
 * appears on by flipping its CSS `order`, without changing the DOM order.
 *
 * @tag clippy-editor-wrapper
 *
 * @slot - The content wrapper (`clippy-editor-content-wrapper`) and the
 *   `clippy-validations-drawer`.
 *
 * @example
 * ```html
 * <clippy-editor-wrapper drawer-position="left">
 *   <clippy-editor-content-wrapper>...</clippy-editor-content-wrapper>
 *   <clippy-validations-drawer></clippy-validations-drawer>
 * </clippy-editor-wrapper>
 * ```
 */
@safeCustomElement(tag)
export class EditorWrapper extends LitElement {
  static override readonly styles = wrapperStyles;

  /** Side of the content on which the drawer is rendered. Defaults to `right`. */
  @property({ attribute: 'drawer-position', reflect: true })
  drawerPosition: DrawerPosition = 'right';

  override render() {
    return html`<slot></slot>`;
  }
}
