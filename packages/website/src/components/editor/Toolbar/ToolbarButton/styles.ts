import { css } from 'lit';

export default css`
  .clippy-toolbar-button {
    background-color: #fff;
    border: 1px solid var(--ma-color-paars-8);
    border-radius: 4px;
    color: var(--ma-color-paars-12);
    margin-inline-end: 0.5rem;
    padding-block: 6px;
    padding-inline: 10px;
  }

  .clippy-toolbar-button--pressed {
    background-color: var(--ma-color-paars-1);
    border-color: var(--ma-color-grijs-6);
  }

  .clippy-sr-only {
    block-size: 1px !important;
    border: 0 !important;
    clip: rect(1px, 1px, 1px, 1px) !important;
    -webkit-clip-path: inset(50%) !important;
    clip-path: inset(50%) !important;
    inline-size: 1px !important;
    margin-block: -1px !important;
    margin-inline: -1px !important;
    overflow: hidden !important;
    padding-block: 0 !important;
    padding-inline: 0 !important;
    position: absolute !important;
    white-space: nowrap !important;
  }
`;
