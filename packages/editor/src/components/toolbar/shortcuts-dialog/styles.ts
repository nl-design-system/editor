import { css } from 'lit';

export default css`
  .clippy-shortcuts__dialog {
    background-color: #fff;
    border: 1px solid var(--basis-color-action-1-color-active);
    color: var(--basis-color-text);
    padding-block: var(--basis-space-block-xl);
    padding-inline: var(--basis-space-inline-xl);
    inline-size: 100%;
    max-inline-size: 650px;
  }

  .clippy-shortcuts__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    & h1 {
      margin-block: var(--basis-space-inline-sm);
    }
  }

  hr {
    --utrecht-space-around: 1;
    --utrecht-separator-margin-block-start: 12px;
    --utrecht-separator-margin-block-end: 12px;
  }

  kbd {
    display: inline-block;
    border: 1px solid var(--basis-color-action-1-color-active);
    padding-block: var(--basis-space-block-sm);
    padding-inline: var(--basis-space-inline-sm);
    border-radius: 0.5em;
    background-color: var(--basis-color-default-bg-default);
  }
`;
