import { css } from 'lit';

export default css`
  .clippy-tabs {
    display: flex;
    gap: 0;
    border-block-end: 1px solid var(--clippy-validations-dialog-tabs-border-color);
  }

  .clippy-tabs__tab {
    display: flex;
    align-items: center;
    gap: var(--basis-space-inline-md);
    padding-inline: var(--basis-space-inline-md);
    padding-block: var(--basis-space-block-sm);
    background-color: transparent;
    border: none;
    border-block-end: 4px solid transparent;
    font-family: inherit;
    font-size: 0.875rem;
    cursor: pointer;
    position: relative;
    margin-block-end: -1px;
  }

  .clippy-tabs__tab:hover:not(:disabled) {
    border-block-end: 4px solid #838383;
  }

  .clippy-tabs__tab--active {
    border-block-end: 4px solid var(--ma-color-paars-8);
  }

  .clippy-tabs__tab:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .clippy-tabs__label {
    display: inline-block;
  }
`;
