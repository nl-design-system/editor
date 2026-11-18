import { css } from 'lit';

export default css`
  :host {
    display: none;
    position: fixed;
    inset-block-start: var(--clippy-sidebar-offset-block-start, 0);
    inset-block-end: 0;
    inset-inline-end: 0;
    inline-size: var(--clippy-sidebar-inline-size, min(24rem, 100vw));
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

  .clippy-drawer__tabs {
    --ams-tabs-list-box-shadow: inset 0 calc(-1 * var(--basis-border-width-sm)) 0 0
      var(--basis-color-default-border-subtle);
    --ams-tabs-button-color: var(--basis-color-action-1-color-default);
    --ams-tabs-button-cursor: var(--basis-action-activate-cursor);
    --ams-tabs-button-font-family: var(--basis-text-font-family-default);
    --ams-tabs-button-font-size: var(--basis-text-font-size-md);
    --ams-tabs-button-font-weight: var(--basis-text-font-weight-default);
    --ams-tabs-button-line-height: var(--basis-text-line-height-md);
    --ams-tabs-button-outline-offset: calc(-1 * var(--basis-focus-outline-offset));
    --ams-tabs-button-padding-block: var(--basis-space-block-sm);
    --ams-tabs-button-padding-inline: var(--basis-space-inline-md);
    --ams-tabs-button-hover-box-shadow: inset 0 calc(-1 * var(--basis-border-width-sm)) 0 0 currentColor;
    --ams-tabs-button-hover-color: var(--basis-color-action-1-color-hover);
    --ams-tabs-button-selected-box-shadow: inset 0 calc(-1 * var(--basis-border-width-lg)) 0 0 currentColor;
    --ams-tabs-button-selected-font-weight: var(--basis-text-font-weight-bold);

    flex-shrink: 0;
    margin-block-end: var(--basis-space-block-lg);
    margin-inline: var(--basis-space-inline-xl);
  }

  .ams-tabs__button:focus-visible {
    outline: var(--basis-focus-outline-color) var(--basis-focus-outline-style) var(--basis-focus-outline-width);
  }

  .clippy-drawer__filters {
    padding-block-end: var(--basis-space-block-lg);
    padding-inline: var(--basis-space-inline-xl);
  }

  .clippy-drawer__body {
    flex: 1;
    min-block-size: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
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
