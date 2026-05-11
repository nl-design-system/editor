import { css } from 'lit';

export default css`
  :host {
    block-size: 0;
    border-inline-start: 1px solid var(--basis-color-default-border-default, #e5e7eb);
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    inline-size: 0;
    overflow: hidden;
    transition:
      inline-size 0.25s ease,
      block-size 0.25s ease;
  }

  :host([open]) {
    block-size: calc(
      100dvh
      - var(--clippy-validations-dialog-inset-block-start, 0px)
      - var(--clippy-validations-dialog-inset-block-end, 0px)
    );
    inline-size: clamp(280px, 30vw, 480px);
    inset-block-end: var(--clippy-validations-dialog-inset-block-end, 0px);
    inset-block-start: var(--clippy-validations-dialog-inset-block-start, 0px);
    inset-inline-end: 0;
    position: fixed;
    z-index: var(--clippy-validations-dialog-z-index, 100);
  }

  .clippy-dialog__close-button {
    border: none;
    background: none;
    float: inline-end;
  }

  .clippy-dialog__content {
    block-size: 100%;
    display: flex;
    flex-direction: column;
    inline-size: clamp(280px, 30vw, 480px);
    overflow: hidden;
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
