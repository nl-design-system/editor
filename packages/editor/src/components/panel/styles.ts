import { css } from 'lit';

export default css`
  .clippy-panel {
    display: grid;
    gap: var(--basis-space-block-md);
    list-style: none;
    margin-block: 0;
    padding-block: 0;
    padding-inline: 0;
  }

  .clippy-panel__item {
    align-items: start;
    display: grid;
    gap: var(--basis-space-block-sm);
    justify-items: start;
  }

  .clippy-panel__summary {
    display: grid;
  }

  .clippy-panel__focus {
    all: unset;
    cursor: pointer;
    display: grid;
  }

  .clippy-panel__focus:focus-visible {
    outline-color: var(--basis-focus-outline-color);
    outline-offset: var(--basis-focus-outline-offset);
    outline-style: var(--basis-focus-outline-style);
    outline-width: var(--basis-focus-outline-width);
  }

  .clippy-panel__source {
    font-weight: var(--basis-text-font-weight-bold);
  }
`;
