import { css } from 'lit';

export default css`
  :host {
    block-size: 100%;
    inset-block-start: 0;
    inset-inline-end: 0;
    position: absolute;
    align-items: flex-end;
    display: flex;
    inline-size: fit-content;
    pointer-events: none;
  }

  :host > * {
    pointer-events: auto;
  }

  .clippy-validations-gutter__list {
    list-style: none;
    padding-inline: 0;
  }

  .clippy-validations-gutter__indicator {
    background: var(--ma-color-paars-8);
    block-size: 30px;
    display: block;
    inline-size: 1rem;
    inset-inline-end: 0;
    opacity: 50%;
    position: absolute;
  }
  .clippy-validations-gutter__indicator:hover {
    opacity: 100%;
  }
`;
