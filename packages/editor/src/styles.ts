import { css } from 'lit';

export default css`
  :host {
    background-color: #fff;
    display: block;
    padding-block: var(--basis-space-inline-xl);
    padding-inline: var(--basis-space-inline-xl);
    position: relative;
  }

  .clippy-editor-content {
    padding-block: var(--basis-space-inline-lg);
    padding-inline: var(--basis-space-inline-lg);
  }

  .clippy-editor-content:focus-visible {
    outline-style: dashed;
    outline-color: var(--ma-color-paars-8);
    outline-offset: -1px;
  }
`;
