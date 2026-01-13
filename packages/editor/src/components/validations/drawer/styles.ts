import { css } from 'lit';

export default css`
  :host {
    block-size: 100%;
    inset-block-start: 0;
    inset-inline-end: 0;
    position: fixed;
    align-items: flex-start;
    display: flex;
    inline-size: fit-content;
    pointer-events: none;
    background: #fff;
    border-inline-start: 1px solid var(--clippy-validations-dialog-border-color);
  }
  :host > * {
    pointer-events: auto;
  }
  .clippy-dialog__close-button {
    border: none;
    background: none;
    float: inline-end;
  }

  .clippy-dialog__content {
    padding-inline-end: var(--basis-space-inline-xl);
    padding-block-end: calc(var(--basis-space-inline-xl) * 2);
    position: relative;
    margin-block: unset;
    margin-inline: unset;
    background: transparent;
    border: 0;
    overflow: auto;
    max-inline-size: 500px;
    max-block-size: calc(100% - var(--basis-space-inline-xl) * 2);
    &:focus-visible {
      outline: none;
    }
  }

  .clippy-dialog__list {
    display: grid;
    gap: var(--basis-space-inline-xl);
    list-style: none;
    margin-block: var(--basis-space-inline-xl) 0;
    padding-block: 0;
    padding-inline: 0;
  }
`;
