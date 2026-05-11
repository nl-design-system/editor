import { html, LitElement } from 'lit';
import { safeCustomElement } from '@/decorators/SafeCustomElementDecorator.ts';
import '../validations/drawer';
import wrapperStyles from './styles.ts';

const tag = 'clippy-editor-wrapper';

declare global {
  interface HTMLElementTagNameMap {
    [tag]: EditorWrapper;
  }
}

/**
 * Layout wrapper that places a `<clippy-editor>` alongside the
 * `<clippy-validations-dialog>` panel in a side-by-side flex row.
 *
 * Place this element between your page header and footer so the
 * dialog panel never overlaps those regions.
 *
 * Usage:
 * ```html
 * <clippy-editor-wrapper>
 *   <clippy-editor id="my-editor">…</clippy-editor>
 * </clippy-editor-wrapper>
 * ```
 *
 * Accessibility:
 * - The wrapper is a landmark-free flex container; the `<aside>` inside
 *   `<clippy-validations-dialog>` carries its own `aria-label`.
 * - Keyboard focus order: editor first, dialog panel second (DOM order).
 */
@safeCustomElement(tag)
export class EditorWrapper extends LitElement {
  static override readonly styles = wrapperStyles;

  override render() {
    return html`
      <div class="clippy-editor-wrapper__main">
        <slot></slot>
      </div>
      <clippy-validations-dialog></clippy-validations-dialog>
    `;
  }
}

