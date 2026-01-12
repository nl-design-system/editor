import { css } from 'lit';

export default css`
  .clippy-toolbar__wrapper {
    /* Wrap the toolbar to make a toolbar with many items fit on small screens. */
    display: flex;
    flex-wrap: wrap;
    gap: var(--basis-space-inline-sm);
    background-color: var(--ma-color-paars-1);
    border: 1px solid var(--ma-color-paars-8);
    border-radius: 3px;
    padding-block: var(--basis-space-inline-md);
    padding-inline: var(--basis-space-inline-md);
  }

  .clippy-toolbar__divider {
    inline-size: 2px;
    margin-inline: var(--basis-space-inline-sm);
    background: var(--ma-color-paars-8);
  }

  .clippy-screen-reader-text {
    border: 0;
    clip-path: inset(50%);
    height: 1px;
    margin: -1px;
    overflow: hidden;
    padding: 0;
    position: absolute;
    width: 1px;
    word-wrap: normal !important;
  }

  .nl-number-badge--clippy {
    position: absolute;
    inset-block-start: calc(var(--nl-number-badge-min-block-size) * -0.3);
    inset-inline-end: calc(var(--nl-number-badge-min-inline-size) * -0.3);
  }
`;
