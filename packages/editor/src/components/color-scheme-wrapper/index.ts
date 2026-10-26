import { safeCustomElement } from '@nl-design-system-community/clippy-components/lib/decorators';
import { css, html, LitElement } from 'lit';
import { setDarkColorScheme, watchHostColorScheme, THEME_CLASS } from '@/utils/colorScheme';

const tag = 'clippy-color-scheme-wrapper';

declare global {
  interface HTMLElementTagNameMap {
    [tag]: ColorSchemeWrapper;
  }
}

/**
 * Theme scope for Clippy components used outside the editor. It applies the Clippy theme to its
 * children and follows the color scheme of the page around it, without affecting layout.
 *
 * @tag clippy-color-scheme-wrapper
 *
 * @slot - The components to theme.
 *
 * @example
 * ```html
 * <clippy-color-scheme-wrapper>
 *   <clippy-alt-text-wizard-button></clippy-alt-text-wizard-button>
 * </clippy-color-scheme-wrapper>
 * ```
 */
@safeCustomElement(tag)
export class ColorSchemeWrapper extends LitElement {
  static override readonly styles = css`
    :host {
      display: contents;
    }
  `;

  private _unwatchColorScheme: (() => void) | null = null;

  override connectedCallback() {
    super.connectedCallback();
    this.classList.add(THEME_CLASS, 'clippy-theme', 'utrecht-theme');
    this._unwatchColorScheme = watchHostColorScheme(this, (colorScheme) =>
      setDarkColorScheme(colorScheme === 'dark', this),
    );
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this._unwatchColorScheme?.();
    this._unwatchColorScheme = null;
  }

  override render() {
    return html`<slot></slot>`;
  }
}
