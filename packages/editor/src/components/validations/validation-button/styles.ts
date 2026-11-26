import { css } from 'lit';

export default css`
  :host {
    display: inline-flex;
    flex-shrink: 0;
  }

  .clippy-validation-button {
    align-items: center;
    background: none;
    block-size: var(--basis-size-icon-md);
    border-radius: var(--basis-border-radius-sm);
    border-width: var(--basis-border-width-none);
    color: var(--basis-color-info-color-default);
    cursor: pointer;
    display: inline-flex;
    inline-size: var(--basis-size-icon-md);
    justify-content: center;
    padding: 0;

    &:focus-visible {
      outline: var(--basis-focus-outline-color) var(--basis-focus-outline-style) var(--basis-focus-outline-width);
      outline-offset: var(--basis-focus-outline-offset);
    }

    svg {
      block-size: var(--basis-size-icon-sm);
      inline-size: var(--basis-size-icon-sm);
    }
  }

  .clippy-validation-button__icon {
    display: flex;
  }

  .clippy-validation-button--error {
    color: var(--basis-color-negative-color-default);
  }

  .clippy-validation-button--warning {
    color: var(--basis-color-warning-color-default);
  }
`;
