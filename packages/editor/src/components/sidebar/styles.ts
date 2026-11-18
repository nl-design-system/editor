import { css } from 'lit';

/* Views are laid out as 'display: contents' and place their own header and body in the
   'header' and 'body' areas of the sidebar grid. */
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

  .clippy-sidebar {
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
      display: grid;
      grid-template-areas:
        'header close'
        'body body'
        'footer footer';
      grid-template-columns: minmax(0, 1fr) auto;
      grid-template-rows: auto minmax(0, 1fr) auto;
      column-gap: var(--basis-space-inline-md);
    }
  }

  .clippy-sidebar__header {
    grid-area: header;
    align-self: center;
    padding-inline-start: var(--basis-space-inline-xl);
  }

  .clippy-sidebar__close-button {
    grid-area: close;
    align-self: center;
    border: none;
    background: none;
  }

  ::slotted(:not([slot])) {
    grid-area: body;
    min-block-size: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
    padding-inline: var(--basis-space-inline-xl);
    padding-block-end: var(--basis-space-block-xl);
  }

  .clippy-sidebar__footer {
    grid-area: footer;
    border-block-start: var(--basis-border-width-sm) solid var(--basis-color-default-border-subtle);
    padding-block: var(--basis-space-block-lg);
    padding-inline: var(--basis-space-inline-xl);
  }
`;
