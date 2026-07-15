import { css } from 'lit';

export default css`
  :host {
    display: flex;
  }

  .clippy-drawer__close-button {
    border: none;
    background: none;
  }

  .clippy-drawer__content {
    block-size: 100%;
    inline-size: fit-content;
    min-inline-size: 300px;
    max-inline-size: 500px;
    max-block-size: 100%;
    border: 0;
    background-color: var(--basis-color-action-1-bg-default);
    border-block-start: var(--basis-border-width-md) solid var(--basis-color-accent-1-border-default);
    margin: 0;
    padding-inline: 0;
    padding-block: 0;
    overflow: hidden;

    &:not([hidden]) {
      display: flex;
      flex-direction: column;
    }
  }

  .clippy-drawer__header {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--basis-space-inline-md);
    padding-block: var(--basis-space-none);
    padding-inline-start: var(--basis-space-inline-xl);
  }

  .clippy-drawer__title {
    margin-block: var(--basis-space-none);
    font-family: var(--nl-paragraph-font-family, inherit);
  }

  .clippy-drawer__filters {
    padding-block-end: var(--basis-space-block-lg);
    padding-inline: var(--basis-space-inline-xl);
  }

  .clippy-drawer__body {
    flex: 1;
    min-block-size: 0;
    overflow-y: auto;
    padding-inline: var(--basis-space-inline-xl);
    padding-block-end: var(--basis-space-block-xl);
  }

  .clippy-drawer__list {
    display: grid;
    gap: var(--basis-space-inline-xl);
    list-style: none;
    margin-block: var(--basis-space-none);
    padding-block: var(--basis-space-none);
    padding-inline: var(--basis-space-none);
  }

  @media (forced-colors: active) {
    .clippy-drawer::after {
      background-color: CanvasText;
      color: Canvas;
    }
  }
`;
