import { css } from 'lit';

export default css`
  :host {
    block-size: 100%;
    inset-block-start: 0;
    inset-inline-end: 0;
    position: absolute;
    align-items: flex-end;
    display: flex;
    inline-size: fit-content;
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
    background: oklch(from var(--ma-color-paars-8) l c h / 25%);
    display: grid;
    gap: 0.5rem;
    list-style: none;
    margin-block: 0;
    padding-block: 0.5rem;
    padding-inline: 0.5rem;
  }

  .clippy-dialog__list-item {
    display: grid;
    gap: 10px;
    background-color: white;
    border: 1px solid var(--ma-color-paars-8);
    padding-block: 1rem;
    padding-inline: 1rem;
    min-inline-size: 250px;
  }

  .clippy-dialog__list-item-message {
    display: flex;
    gap: var(--basis-space-inline-sm);
  }

  .clippy-dialog__list-item-severity {
    &.clippy-dialog__list-item-severity--warning {
      color: var(--ma-color-signal-warning-700);
    }
    &.clippy-dialog__list-item-severity--error {
      color: var(--ma-color-signal-rood-500);
    }
  }

  .clippy-dialog__list-item-link {
  }
  .clippy-dialog__list-item-actions {
    display: flex;
    justify-content: space-between;
  }
`;
