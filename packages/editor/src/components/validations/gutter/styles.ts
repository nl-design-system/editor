import { css } from 'lit';

export default css`
  :host {
    block-size: 100%;
    inset-block-start: 0;
    inset-inline-start: 0;
    inset-inline-end: 0;
    position: absolute;
    display: block;
    pointer-events: none;
    z-index: 1;
  }

  .clippy-validations-gutter__list {
    list-style: none;
    padding: 0;
    margin: 0;
    position: relative;
    block-size: 100%;
  }

  .clippy-validations-gutter__indicator {
    inline-size: 100%;
    inset-inline-start: 0;
    position: absolute;

    /* Full-width background strip — capped to indicator width */
    &::before {
      content: '';
      position: absolute;
      inset-block-start: 0;
      inset-inline-start: 0;
      block-size: 100%;
      inline-size: 100%;
      pointer-events: none;
      z-index: 0;
    }

    &[data-severity='error']::before {
      background-color: color-mix(in srgb, var(--basis-color-negative-bg-default), transparent 50%);
    }
    &[data-severity='warning']::before {
      background-color: color-mix(in srgb, var(--basis-color-warning-bg-default), transparent 50%);
    }
    &[data-severity='info']::before {
      background-color: color-mix(in srgb, var(--basis-color-info-bg-default), transparent 50%);
    }
  }

  .clippy-validations-gutter__toggle {
    pointer-events: auto;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    position: absolute;
    inset-block-start: 0;
    inset-inline-start: 0;
    block-size: 100%;
    inline-size: 1rem;
    z-index: 1;

    /* 2px vertical line, aligned to the left edge */
    &::before {
      content: '';
      position: absolute;
      inset-block-start: 0;
      inset-inline-start: 0;
      block-size: 100%;
      inline-size: 2px;
      border-radius: 0 0 1px 1px;
      transition: opacity 0.2s;
    }

    /* Triangle: right-angle top-left, horizontal top, vertical left, 45° hypotenuse */
    &::after {
      content: '';
      position: absolute;
      inset-block-start: 0;
      inset-inline-start: 0;
      inline-size: 8px;
      block-size: 8px;
      clip-path: polygon(0 0, 100% 0, 0 100%);
    }

    &.clippy-validations-gutter__toggle--error::before {
      background-color: var(--basis-color-negative-border-default);
    }
    &.clippy-validations-gutter__toggle--error::after {
      background-color: var(--basis-color-negative-border-default);
    }
    &.clippy-validations-gutter__toggle--warning::before {
      background-color: var(--basis-color-warning-border-default);
    }
    &.clippy-validations-gutter__toggle--warning::after {
      background-color: var(--basis-color-warning-border-default);
    }
    &.clippy-validations-gutter__toggle--info::before {
      background-color: var(--basis-color-info-border-default);
    }
    &.clippy-validations-gutter__toggle--info::after {
      background-color: var(--basis-color-info-border-default);
    }

    &:hover::before,
    &:focus-visible::before,
    &.clippy-validations-gutter__toggle--active::before {
      opacity: 0.7;
    }
  }

  .clippy-validations-gutter__toggle:focus-visible {
    outline: 2px solid Highlight;
    outline-offset: 1px;
  }

  @media (forced-colors: active) {
    .clippy-validations-gutter__toggle:focus-visible {
      outline-color: Highlight;
    }
    .clippy-validations-gutter__toggle::before,
    .clippy-validations-gutter__toggle::after {
      background-color: CanvasText !important;
    }
  }

  .clippy-validation-gutter__tooltip {
    display: none;
    position: absolute;
    inset-block-start: 0;
    inset-inline-end: 100%;
    z-index: 10;
    background-color: white;
    pointer-events: auto;
  }
  .clippy-validation-gutter__tooltip--active {
    display: block;
  }

  /* Anchor element that positions both the icon button and the tooltip together */
  .clippy-validations-gutter__meta-anchor {
    position: absolute;
    inset-block-start: 50%;
    inset-inline-end: 0.5rem;
    transform: translateY(-50%);
    z-index: 1;
    pointer-events: auto;
  }

  /* Icon + badge button on the right side of the indicator bar */
  .clippy-validations-gutter__meta {
    background: none;
    border: none;
    cursor: pointer;
    pointer-events: auto;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    line-height: 1;
    padding: 0.125rem;
    border-radius: 0.25rem;

    &:hover,
    &:focus-visible {
      outline: 2px solid currentColor;
      outline-offset: 2px;
    }
  }

  .clippy-validations-gutter__icon {
    display: flex;
    align-items: center;
    block-size: 1rem;
    inline-size: 1rem;

    svg {
      block-size: 100%;
      inline-size: 100%;
    }
  }

  .clippy-validations-gutter__meta--error .clippy-validations-gutter__icon {
    color: var(--basis-color-negative-color-default);
  }
  .clippy-validations-gutter__meta--warning .clippy-validations-gutter__icon {
    color: var(--basis-color-warning-color-default);
  }
  .clippy-validations-gutter__meta--info .clippy-validations-gutter__icon {
    color: var(--basis-color-info-color-default);
  }

  /* Override nl-number-badge colors per severity */
  .clippy-validations-gutter__badge--error {
    --nl-number-badge-background-color: var(--basis-color-negative-bg-default, rgba(220, 38, 38, 0.15));
    --nl-number-badge-color: var(--basis-color-negative-color-default, rgb(220, 38, 38));
  }
  .clippy-validations-gutter__badge--warning {
    --nl-number-badge-background-color: var(--basis-color-warning-bg-default, rgba(234, 179, 8, 0.15));
    --nl-number-badge-color: var(--basis-color-warning-color-default, rgb(180, 130, 0));
  }
  .clippy-validations-gutter__badge--info {
    --nl-number-badge-background-color: var(--basis-color-default-bg-default, rgba(59, 130, 246, 0.15));
    --nl-number-badge-color: var(--basis-color-default-color-default, rgb(59, 130, 246));
  }
`;
