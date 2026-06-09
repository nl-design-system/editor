import { css } from 'lit';

export default css`
  .clippy-toolbar__wrapper {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: start;
    gap: var(--basis-space-inline-sm);
    background-color: var(--basis-color-action-1-bg-default);
    border-block-start: var(--basis-border-width-md) solid var(--basis-color-accent-1-border-default);
    padding-block: var(--basis-space-inline-md);
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
  .clippy-toolbar__group:has(> :not([hidden]))::after {
    content: '';
    display: block;
    inline-size: var(--basis-border-width-md);
    height: calc(100% - 2 * var(--basis-space-inline-md));
    background: var(--basis-color-accent-1-border-subtle);
  }

  /* Remove the divider from the last group */
  .clippy-toolbar__group:last-of-type::after {
    display: none;
  }

  .clippy-screen-reader-text {
    border: 0;
    clip-path: inset(50%);
    height: 1px;
    margin: -1px;
    overflow: hidden;
    padding: 0;
    position: absolute;
    width: 1px;
    word-wrap: normal !important;
  }

  .clippy-toolbar__dot-badge {
    position: absolute;
    inset-block-start: var(--basis-space-inline-sm);
    inset-inline-end: var(--basis-space-inline-sm);
    inline-size: var(--basis-space-inline-md);
    block-size: var(--basis-space-inline-md);
    border-radius: 50%;
    background-color: var(--basis-color-negative-inverse-bg-default);
    pointer-events: none;
  }
`;
