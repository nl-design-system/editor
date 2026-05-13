import { css } from 'lit';

export default css`
  :host {
    display: contents;
  }

  .clippy-dialog__close-button {
    border: none;
    background: none;
    float: inline-end;
  }

  .clippy-dialog__content {
    position: fixed;
    inset-block-start: 0;
    inset-inline-end: 0;
    block-size: 100%;
    inline-size: fit-content;
    max-inline-size: 500px;
    max-block-size: 100%;
    border: 0;
    margin-inline-end: 0;
    padding-inline: 0;
    padding-block: 0;
    overflow: hidden;

    &[open] {
      display: flex;
      flex-direction: column;
    }

    &:focus-visible {
      outline: none;
    }
  }

  .clippy-dialog__header {
    flex-shrink: 0;
    padding-block: var(--basis-space-block-xl);
    padding-inline: var(--basis-space-inline-xl);
  }

  .clippy-dialog__body {
    flex: 1;
    min-block-size: 0;
    overflow-y: auto;
    padding-inline: var(--basis-space-inline-xl);
    padding-block-end: var(--basis-space-block-xl);
  }

  .clippy-dialog__list {
    display: grid;
    gap: var(--basis-space-inline-xl);
    list-style: none;
    margin-block: 0;
    padding-block: 0;
    padding-inline: 0;
  }

  @media (forced-colors: active) {
    .clippy-dialog__list-item::after {
      background-color: CanvasText;
      color: Canvas;
    }
  }
`;
