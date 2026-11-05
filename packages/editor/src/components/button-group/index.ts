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
 * The menu drops below the buttons. The group can only style the menu itself, not its items, so
 * it hands the items their border radius through `--clippy-button-group-menu-item-border-radius`.
 *
 * @tag clippy-button-group
 *
 * @slot primary - The main action, at the start.
 * @slot secondary - The button at the end, typically an icon-only `clippy-button` that opens a menu.
 * @slot menu - The menu the secondary button opens, typically a `<ul role="menu">`.
 *
 * @cssprop --clippy-button-group-menu-background-color - Background of the menu.
 * @cssprop --clippy-button-group-menu-border-color - Border color of the menu.
 * @cssprop --clippy-button-group-menu-border-radius - Corners of the menu.
 * @cssprop --clippy-button-group-menu-border-width - Border width of the menu.
 * @cssprop --clippy-button-group-menu-box-shadow - Shadow of the menu.
 * @cssprop --clippy-button-group-menu-item-border-radius - Corners of the menu items, square by default.
 * @cssprop --clippy-button-group-menu-margin-block-start - Space between the buttons and the menu.
 * @cssprop --clippy-button-group-menu-padding-block - Space above the first and below the last menu item.
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
      --clippy-button-group-menu-background-color: var(--basis-color-default-bg-document);
      --clippy-button-group-menu-border-color: var(--basis-color-default-border-default);
      --clippy-button-group-menu-border-radius: var(--basis-border-radius-md);
      --clippy-button-group-menu-border-width: var(--basis-border-width-sm);
      --clippy-button-group-menu-box-shadow: var(--basis-box-shadow-md);
      --clippy-button-group-menu-item-border-radius: 0;
      --clippy-button-group-menu-margin-block-start: var(--basis-space-block-xs);
      --clippy-button-group-menu-padding-block: var(--basis-space-block-xs);

      display: inline-flex;
      position: relative;
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

    ::slotted([slot='menu']) {
      background-color: var(--clippy-button-group-menu-background-color);
      border-color: var(--clippy-button-group-menu-border-color);
      border-radius: var(--clippy-button-group-menu-border-radius);
      border-style: solid;
      border-width: var(--clippy-button-group-menu-border-width);
      box-shadow: var(--clippy-button-group-menu-box-shadow);
      box-sizing: border-box;
      inset-block-start: 100%;
      inset-inline-start: 0;
      list-style-type: none;
      margin-block: var(--clippy-button-group-menu-margin-block-start) 0;
      margin-inline: 0;
      min-inline-size: 100%;
      padding-block: var(--clippy-button-group-menu-padding-block);
      padding-inline: 0;
      position: absolute;
      z-index: 1;
    }
  `;

  override render() {
    return html`<slot name="primary"></slot><slot name="secondary"></slot><slot name="menu"></slot>`;
  }
}
