import { css } from 'lit';

/** Places the header and the body of a view in the areas of the `clippy-sidebar` it is shown in. */
export default css`
  :host {
    display: contents;
  }

  :host([hidden]) {
    display: none;
  }

  .clippy-sidebar-view__header {
    grid-area: header;
    align-self: center;
    min-inline-size: 0;
    padding-inline-start: var(--basis-space-inline-xl);
  }

  .clippy-sidebar-view__body {
    grid-area: body;
    min-block-size: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
    padding-inline: var(--basis-space-inline-xl);
    padding-block-end: var(--basis-space-block-xl);
  }
`;
