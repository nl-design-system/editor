import { css } from 'lit';

export default css`
  .clippy-editor-toolbar__button {
    background-color: #fff;
    border: 1px solid var(--ma-color-paars-8);
    border-radius: 4px;
    color: var(--ma-color-paars-12);
    margin-inline-end: 0.5rem;
    padding-block: 6px;
    padding-inline: 10px;
  }

  .clippy-editor-toolbar__button--pressed {
    background-color: var(--ma-color-paars-1);
    border-color: var(--ma-color-grijs-6);
  }
`;
