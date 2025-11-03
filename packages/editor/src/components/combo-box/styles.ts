import { css } from 'lit';

export default css`
  :host {
    position: relative;
    display: inline-block;
  }
  .clippy-combo-box {
    inline-size: 100%;
    max-inline-size: 500px;
    position: relative;
  }
  .clippy-combobox__input {
    line-height: 1.8em;
    background-color: #fff;
    border: 1px solid var(--basis-color-action-1-color-active);
    border-radius: 3px;
    color: var(--basis-color-action-1-color-active);
    padding-block: var(--basis-space-inline-sm);
    padding-inline: var(--basis-space-inline-md);
  }
`;
