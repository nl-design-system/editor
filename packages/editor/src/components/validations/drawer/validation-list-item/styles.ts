import { css } from 'lit';

export default css`
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

  .clippy-dialog__list-item-tip {
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
