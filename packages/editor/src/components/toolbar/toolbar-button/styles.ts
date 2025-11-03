import { css } from 'lit';

export default css`
  :host {
    display: inline-block;
  }
  .clippy-toolbar-button {
    position: relative;
    background-color: #fff;
    border: 1px solid var(--basis-color-action-1-color-active);
    border-radius: 3px;
    color: var(--basis-color-action-1-color-active);
    display: inline-flex;
    padding-block: var(--basis-space-inline-sm);
    padding-inline: var(--basis-space-inline-md);
  }
  ::slotted(svg) {
    inline-size: 16px;
  }
  .clippy-toolbar-button--pressed {
    background-color: var(--basis-color-action-1-bg-default);
    border-color: var(--ma-color-grijs-6);
  }
`;
