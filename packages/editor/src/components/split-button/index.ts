import { safeCustomElement } from '@nl-design-system-community/clippy-components/lib/decorators';
import { css, html, LitElement } from 'lit';

const tag = 'clippy-split-button';

declare global {
  interface HTMLElementTagNameMap {
    [tag]: SplitButton;
  }
}

/**
 * Joins a primary button and a secondary button, typically one that opens a menu, into one control.
 * The corners where the two buttons meet are squared.
 *
 * The slotted buttons are expected to render an `nl-button`, which reads its corners from
 * `--nl-button-border-radius`: the split button overrides that per button with the theme's own value.
 *
 * The menu drops below the buttons. The split button can only style the menu itself, not its items, so
 * it hands the items their border radius through `--clippy-split-button-menu-item-border-radius`.
 *
 * @tag clippy-split-button
 *
 * @slot primary - The main action, at the start.
 * @slot secondary - The button at the end, typically an icon-only `clippy-button` that opens a menu.
 * @slot menu - The menu the secondary button opens, typically a `<ul role="menu">`.
 *
 * @cssprop --clippy-split-button-divider-color - Line between a `purpose="primary"` primary button and the secondary one.
 * @cssprop --clippy-split-button-divider-width - Width of that line.
 * @cssprop --clippy-split-button-menu-background-color - Background of the menu.
 * @cssprop --clippy-split-button-menu-border-color - Border color of the menu.
 * @cssprop --clippy-split-button-menu-border-radius - Corners of the menu.
 * @cssprop --clippy-split-button-menu-border-width - Border width of the menu.
 * @cssprop --clippy-split-button-menu-box-shadow - Shadow of the menu.
 * @cssprop --clippy-split-button-menu-item-border-radius - Corners of the menu items, square by default.
 *
 * @example
 * ```html
 * <clippy-split-button>
 *   <clippy-button slot="primary" purpose="primary">Corrigeren</clippy-button>
 *   <clippy-button slot="secondary" purpose="primary" icon-only>Meer correcties</clippy-button>
 * </clippy-split-button>
 * ```
 */
@safeCustomElement(tag)
export class SplitButton extends LitElement {
  static override readonly styles = css`
    :host {
      --clippy-split-button-border-radius: var(--nl-button-border-radius);
      --clippy-split-button-divider-color: var(--basis-color-action-1-border-subtle);
      --clippy-split-button-divider-width: 1px;
      --clippy-split-button-menu-background-color: var(--basis-color-default-bg-document);
      --clippy-split-button-menu-border-color: var(--basis-color-default-border-default);
      --clippy-split-button-menu-border-radius: var(--basis-border-radius-md);
      --clippy-split-button-menu-border-width: var(--basis-border-width-sm);
      --clippy-split-button-menu-box-shadow: var(--basis-box-shadow-md);
      --clippy-split-button-menu-item-border-radius: 0;

      display: inline-flex;
      position: relative;
    }

    /* border-radius takes its corners in physical order: top-left, top-right, bottom-right, bottom-left. */
    ::slotted([slot='primary']) {
      --nl-button-border-radius: var(--clippy-split-button-border-radius) 0 0 var(--clippy-split-button-border-radius);
    }

    ::slotted([slot='primary'][purpose='primary']) {
      border-inline-end: var(--clippy-split-button-divider-width) solid var(--clippy-split-button-divider-color);
      display: inline-flex;
    }

    ::slotted([slot='secondary']) {
      --nl-button-border-radius: 0 var(--clippy-split-button-border-radius) var(--clippy-split-button-border-radius) 0;
    }

    :host(:dir(rtl)) ::slotted([slot='primary']) {
      --nl-button-border-radius: 0 var(--clippy-split-button-border-radius) var(--clippy-split-button-border-radius) 0;
    }

    :host(:dir(rtl)) ::slotted([slot='secondary']) {
      --nl-button-border-radius: var(--clippy-split-button-border-radius) 0 0 var(--clippy-split-button-border-radius);
    }

    ::slotted([slot='menu']) {
      background-color: var(--clippy-split-button-menu-background-color);
      border-color: var(--clippy-split-button-menu-border-color);
      border-radius: var(--clippy-split-button-menu-border-radius);
      border-style: solid;
      border-width: var(--clippy-split-button-menu-border-width);
      box-shadow: var(--clippy-split-button-menu-box-shadow);
      box-sizing: border-box;
      inset-block-start: 100%;
      inset-inline-start: 0;
      list-style-type: none;
      margin-block: 0;
      margin-inline: 0;
      min-inline-size: 100%;
      overflow: hidden;
      padding-block: 0;
      padding-inline: 0;
      position: absolute;
      z-index: 1;
    }
  `;

  override render() {
    return html`<slot name="primary"></slot><slot name="secondary"></slot><slot name="menu"></slot>`;
  }
}
