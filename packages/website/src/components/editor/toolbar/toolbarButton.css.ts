import { css } from 'lit';

export default css`
  .clippy-editor-toolbar__button {
    background-color: #fff;
    border: 1px solid var(--ma-color-paars-8);
    border-radius: 4px;
    color: var(--ma-color-paars-12);
    cursor: pointer;
    font-family: inherit;
    font-size: 1em;
    font-weight: 0;
    margin-right: 0.5rem;
    padding: 6px 10px;
  }

  .clippy-editor-toolbar__button--pressed {
    background-color: var(--ma-color-paars-1);
    border-color: var(--ma-color-grijs-6);
  }
`;
