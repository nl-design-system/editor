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

  .clippy-drawer {
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
    padding-inline-start: var(--basis-space-inline-xl);
  }

  .clippy-drawer__header-content {
    flex: 1;
    min-inline-size: 0;
  }

  .clippy-drawer__heading {
    margin-block: var(--basis-space-none);
    color: var(--basis-color-default-color-document);
    font-family: var(--nl-paragraph-font-family, inherit);
  }

  .clippy-drawer__close-button {
    border: none;
    background: none;
  }

  .clippy-drawer__body {
    flex: 1;
    min-block-size: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
    padding-inline: var(--basis-space-inline-xl);
    padding-block-end: var(--basis-space-block-xl);
  }

  .clippy-drawer__footer {
    flex-shrink: 0;
    border-block-start: var(--basis-border-width-sm) solid var(--basis-color-default-border-subtle);
    padding-block: var(--basis-space-block-lg);
    padding-inline: var(--basis-space-inline-xl);
  }
`;
