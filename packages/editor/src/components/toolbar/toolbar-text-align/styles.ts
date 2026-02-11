import { css } from 'lit';

export default css`
  :host {
    position: relative;
  }

  .clippy-icon__dropdown {
    inline-size: 12px;
  }

  .clippy-toolbar-text-align__menu {
    position: absolute;
    display: flex;
    gap: 0.5rem;
    padding-block: 0.5rem;
    padding-inline: 0.5rem;
    background-color: var(--nl-color-surface-default, white);
    border: 1px solid var(--nl-color-border-default, #ccc);
    border-radius: var(--nl-button-border-radius);
    box-shadow: var(--nl-box-shadow-elevated, 0 2px 8px rgba(0, 0, 0, 0.15));
    z-index: 1000;
  }
`;
