import { css } from 'lit';

export default css`
  :host {
    block-size: 100%;
    display: flex;
    inset-block-start: 0;
    inset-inline-end: 0;
    position: absolute;
  }

  .clippy-gutter-list {
    list-style: none;
    margin-block-start: 50px;
  }

  .clippy-gutter-item {
    background: var(--ma-color-paars-8);
    block-size: 30px;
    display: block;
    inline-size: 1rem;
    inset-inline-end: 0;
    opacity: 50%;
    position: absolute;
  }
  .clippy-gutter-item:hover {
    opacity: 100%;
  }

  .clippy-overlay-toggle {
    background: var(--ma-color-paars-8);
    border: 0;
    color: white;
    inset-block-end: 0;
    inset-inline-end: 0;
    position: absolute;
  }

  .clippy-overlay-content {
    background-color: rgb(255 255 255 / 80%);
    block-size: 200px;
    inline-size: 500px;
    inset-block-end: 2rem;
    inset-inline-end: 0;
    padding-block: 1rem;
    padding-inline: 1rem;
    position: absolute;
  }
`;
