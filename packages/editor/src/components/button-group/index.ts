import { safeCustomElement } from '@nl-design-system-community/clippy-components/lib/decorators';
import { css, html, LitElement } from 'lit';

const tag = 'clippy-button-group';

declare global {
  interface HTMLElementTagNameMap {
    [tag]: ButtonGroup;
  }
}

/**
 * Joins a primary button and a secondary button into one control, such as a split button whose
 * secondary half opens a menu. The corners where the two buttons meet are squared.
 *
 * The slotted buttons are expected to render an `nl-button`, which reads its corners from
 * `--nl-button-border-radius`: the group overrides that per button with the theme's own value.
 *
 * @tag clippy-button-group
 *
 * @slot primary - The main action, at the start.
 * @slot secondary - The button at the end, typically an icon-only `clippy-button` that opens a menu.
 *
 * @example
 * ```html
 * <clippy-button-group>
 *   <clippy-button slot="primary" purpose="primary">Corrigeren</clippy-button>
 *   <clippy-button slot="secondary" purpose="primary" icon-only>Meer correcties</clippy-button>
 * </clippy-button-group>
 * ```
 */
@safeCustomElement(tag)
export class ButtonGroup extends LitElement {
  static override readonly styles = css`
    :host {
      --clippy-button-group-border-radius: var(--nl-button-border-radius);

      display: inline-flex;
    }

    /* border-radius takes its corners in physical order: top-left, top-right, bottom-right, bottom-left. */
    ::slotted([slot='primary']) {
      --nl-button-border-radius: var(--clippy-button-group-border-radius) 0 0 var(--clippy-button-group-border-radius);
    }

    ::slotted([slot='secondary']) {
      --nl-button-border-radius: 0 var(--clippy-button-group-border-radius) var(--clippy-button-group-border-radius) 0;
    }

    :host(:dir(rtl)) ::slotted([slot='primary']) {
      --nl-button-border-radius: 0 var(--clippy-button-group-border-radius) var(--clippy-button-group-border-radius) 0;
    }

    :host(:dir(rtl)) ::slotted([slot='secondary']) {
      --nl-button-border-radius: var(--clippy-button-group-border-radius) 0 0 var(--clippy-button-group-border-radius);
    }
  `;

  override render() {
    return html`<slot name="primary"></slot><slot name="secondary"></slot>`;
  }
}
