import { css } from 'lit';

export default css`
  :host {
    position: absolute;
    z-index: 1000;
  }

  .bubble-menu {
    display: flex;
    gap: 0.25rem;
    padding: 0.5rem;
    background: var(--ma-color-background, #fff);
    border-radius: 0.25rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

    &::after {
      content: ' ';
      position: absolute;
      top: 100%;
      left: 50%;
      margin-left: -5px;
      border-width: 5px;
      border-style: solid;
      border-color: var(--ma-color-background, #fff) transparent transparent transparent;
    }
  }
`;
