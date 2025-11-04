import { css } from 'lit';

export default css`
  .clippy-shortcuts__dialog {
    background-color: #fff;
    border: 1px solid var(--basis-color-action-1-color-active);
    color: var(--basis-color-text);
    padding-block: var(--basis-space-block-xl);
    padding-inline: var(--basis-space-inline-xl);
    inline-size: 100%;
    max-inline-size: 600px;
  }

  .clippy-shortcuts__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    & h1 {
      margin-block: var(--basis-space-inline-sm);
    }
  }

  .clippy-shortcuts__table {
    inline-size: 100%;
    border-collapse: collapse;

    & caption {
      text-align: start;
      font-size: 1.5em;
      padding-block: var(--basis-space-block-xl);
    }
    & thead {
      th {
        text-align: start;
        border-block-end: 2px solid var(--basis-color-action-1-color-active);
      }
    }

    & td,
    th {
      padding-block: var(--basis-space-block-sm);
      padding-inline: var(--basis-space-inline-md);
    }

    kbd {
      display: inline-block;
      border: 1px solid var(--basis-color-action-1-color-active);
      padding-block: var(--basis-space-block-sm);
      padding-inline: var(--basis-space-inline-sm);
      border-radius: 0.5em;
      background-color: var(--basis-color-default-bg-default);
    }
  }
`;
