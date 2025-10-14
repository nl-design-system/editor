import { css } from 'lit';

export default css`
  :host {
    position: absolute;
    top: 0;
    right: 0;
    width: 1rem;
    height: 100%;
    display: flex;
  }

  .gutter-list {
    list-style: none;
    margin-top: 50px;
  }

  .gutter-item {
    position: absolute;
    right: 0;
    background: var(--ma-color-paars-8);
    opacity: 0.5;
    display: block;
    width: 1rem;
    height: 30px;
  }
  .gutter-item:hover {
    opacity: 1;
  }

  .overlay-toggle {
    position: absolute;
    bottom: 0;
    background: var(--ma-color-paars-8);
    border: 0;
    color: white;
    right: 0;
  }

  .overlay-content {
    position: fixed;
    bottom: 0;
    left: 0;
    height: 200px;
    width: 500px;
  }
`;
