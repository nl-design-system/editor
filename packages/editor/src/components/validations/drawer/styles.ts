import { css } from 'lit';

export default css`
  :host {
    display: none;
    position: fixed;
    inset-block-start: var(--clippy-drawer-offset-block-start, 0);
    inset-block-end: 0;
    inset-inline-end: 0;
    inline-size: var(--clippy-drawer-inline-size, min(24rem, 100vw));
    z-index: 2147483000;
  }

  :host([open]) {
    display: flex;
  }

  .clippy-drawer__close-button {
    border: none;
    background: none;
  }

  .clippy-drawer__content {
    box-sizing: border-box;
    block-size: 100%;
    inline-size: 100%;
    border: 0;
    box-shadow: var(--basis-box-shadow-lg);
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
    color: var(--basis-color-default-color-document);
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
