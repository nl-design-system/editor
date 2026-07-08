import { css } from 'lit';

export default css`
  .clippy-toolbar__wrapper {
    --_clippy-toolbar-wrapper-padding-block: var(--basis-space-block-md);
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: start;
    gap: var(--basis-space-inline-sm);
    background-color: var(--basis-color-action-1-bg-default);
    border-block-start: var(--basis-border-width-md) solid var(--basis-color-accent-1-border-default);
    padding-block: var(--_clippy-toolbar-wrapper-padding-block);
    padding-inline: var(--basis-space-inline-md);
  }

  .clippy-toolbar__start {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--basis-space-inline-sm);
  }

  .clippy-toolbar__end {
    display: flex;
    align-items: center;
    justify-self: end;
  }

  .clippy-toolbar__group {
    display: flex;
    flex-wrap: wrap;
    gap: var(--basis-space-inline-sm);
    align-items: center;
    align-self: stretch;
  }

  /* Hide the group itself when all its children are hidden */
  .clippy-toolbar__group:not(:has(> :not([hidden]))) {
    display: none;
  }

  /* Draw a divider after every visible group */
  .clippy-toolbar__group:has(> :not([hidden])):not(:last-of-type)::after {
    content: '';
    display: block;
    inline-size: var(--basis-border-width-md);
    block-size: calc(100% - 2 * var(--_clippy-toolbar-wrapper-padding-block));
    background: var(--basis-color-accent-1-border-subtle);
  }
`;
