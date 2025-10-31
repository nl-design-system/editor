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

  .clippy-gutter-list {
    list-style: none;
    padding-inline: 0;
  }

  .clippy-gutter-item {
    background: var(--ma-color-paars-8);
    block-size: 30px;
    display: block;
    inline-size: 1rem;
    inset-inline-end: 0;
    opacity: 50%;
    position: absolute;
  }
  .clippy-gutter-item:hover {
    opacity: 100%;
  }

  .clippy-dialog-toggle {
    align-items: center;
    background: var(--ma-color-paars-8);
    block-size: 2rem;
    border: 0;
    color: white;
    display: flex;
    inline-size: 2rem;
    inset-inline-end: 0;
    justify-content: center;
    padding-inline: 0;
    position: absolute;
    z-index: 1;
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

  .clippy-dialog__list-item-quote {
    border-left: 5px solid var(--ma-color-paars-8);
    padding-inline-start: var(--basis-space-inline-xl);
  }

  .clippy-dialog__list-item-message {
  }

  .clippy-dialog__list-item-link {
  }
  .clippy-dialog__list-item-actions {
    display: flex;
    justify-content: space-between;
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

  .nl-number-badge--clippy {
    position: absolute;
    inset-block-start: calc(var(--nl-number-badge-min-block-size) * -0.5);
    inset-inline-start: calc(var(--nl-number-badge-min-inline-size) * -0.5);
  }
`;
