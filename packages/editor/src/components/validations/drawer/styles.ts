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
    pointer-events: none;
  }

  :host > * {
    pointer-events: auto;
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
    gap: 0.5rem;
    list-style: none;
    margin-block: 0;
    padding-block: 0.5rem;
    padding-inline: 0.5rem;
  }
`;
