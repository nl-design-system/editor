import { css } from 'lit';

/** Docks a view that renders a `clippy-sidebar` at the end side of the screen while it is open. */
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
`;
