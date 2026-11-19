import { css } from 'lit';

export default css`
  :host {
    display: inline-flex;
  }

  .clippy-validation-toggle {
    --_clippy-validation-toggle-color: var(--basis-color-info-color-default);

    align-items: center;
    background: none;
    border-radius: var(--basis-border-radius-sm);
    border-width: var(--basis-border-width-none);
    column-gap: var(--basis-space-column-sm);
    cursor: pointer;
    display: flex;
    line-height: 1;
    padding-block: var(--basis-space-block-sm);
    padding-inline: var(--basis-space-inline-sm);

    &:hover {
      outline: currentColor solid var(--basis-border-width-md);
      outline-offset: var(--basis-size-5xs);
    }

    &:focus-visible {
      outline: var(--basis-focus-outline-color) var(--basis-focus-outline-style) var(--basis-focus-outline-width);
      outline-offset: var(--basis-focus-outline-offset);
    }

    &.clippy-validation-toggle--error {
      --_clippy-validation-toggle-color: var(--basis-color-negative-color-default);
    }

    &.clippy-validation-toggle--warning {
      --_clippy-validation-toggle-color: var(--basis-color-warning-color-default);
    }
  }

  .clippy-validation-toggle__icon {
    align-items: center;
    block-size: var(--basis-size-icon-sm);
    color: var(--_clippy-validation-toggle-color);
    display: flex;
    inline-size: var(--basis-size-icon-sm);

    svg {
      block-size: 100%;
      inline-size: 100%;
    }
  }

  .clippy-validation-toggle__badge {
    --nl-number-badge-background-color: transparent;
    --nl-number-badge-border-width: var(--basis-border-width-none);
    --nl-number-badge-color: var(--_clippy-validation-toggle-color);
    --nl-number-badge-min-block-size: auto;
    --nl-number-badge-min-inline-size: auto;
    --nl-number-badge-padding-block: var(--basis-space-none);
    --nl-number-badge-padding-inline: var(--basis-space-none);
  }

  @media (forced-colors: active) {
    .clippy-validation-toggle:hover,
    .clippy-validation-toggle:focus-visible {
      outline-color: Highlight;
    }
  }
`;
