import { css } from 'lit';

export default css`
  :host {
    --_clippy-gutter-rail-inline-size: var(--basis-space-inline-xl);

    block-size: 100%;
    inset-block-start: 0;
    inset-inline: 0;
    position: absolute;
    display: block;
    pointer-events: none;
  }

  .clippy-validations-gutter__list {
    list-style: none;
    margin-block: var(--basis-space-none);
    margin-inline: var(--basis-space-none);
    padding-block: var(--basis-space-none);
    padding-inline: var(--basis-space-none);
  }

  .clippy-validations-gutter__indicator {
    --_clippy-gutter-severity-bg: var(--basis-color-info-bg-default);

    block-size: var(--basis-size-xs);
    inline-size: 100%;
    inset-inline-start: 0;
    position: absolute;

    &[data-severity='error'] {
      --_clippy-gutter-severity-bg: var(--basis-color-negative-bg-default);
    }

    &[data-severity='warning'] {
      --_clippy-gutter-severity-bg: var(--basis-color-warning-bg-default);
    }

    &[data-scope='block']::before {
      content: '';
      position: absolute;
      inset-block-start: 0;
      inset-inline-start: 0;
      block-size: 100%;
      inline-size: 100%;
      background-color: color-mix(in srgb, var(--_clippy-gutter-severity-bg), transparent 50%);
      pointer-events: none;
      z-index: -1;
    }
  }

  .clippy-validations-gutter__toggle {
    --_clippy-gutter-flag-color: var(--basis-color-info-border-default);

    background: none;
    block-size: 100%;
    border-width: var(--basis-border-width-none);
    cursor: pointer;
    inline-size: var(--_clippy-gutter-rail-inline-size);
    inset-block-start: 0;
    inset-inline-start: 0;
    padding-block: var(--basis-space-none);
    padding-inline: var(--basis-space-none);
    pointer-events: auto;
    position: absolute;
    z-index: 1;

    &::before {
      content: '';
      position: absolute;
      inset-block-start: 0;
      inset-inline-start: 0;
      block-size: 100%;
      inline-size: var(--basis-border-width-md);
      border-end-end-radius: var(--basis-border-radius-round);
      border-end-start-radius: var(--basis-border-radius-round);
      background-color: var(--_clippy-gutter-flag-color);
      transition: opacity 0.2s;
    }

    &::after {
      content: '';
      position: absolute;
      inset-block-start: 0;
      inset-inline-start: 0;
      block-size: var(--basis-size-3xs);
      inline-size: var(--basis-size-3xs);
      clip-path: polygon(0 0, 100% 0, 0 100%);
      background-color: var(--_clippy-gutter-flag-color);
      transition: opacity 0.2s;
    }

    /* clip-path has no logical form, so mirror the flag for right-to-left. */

    &:dir(rtl)::after {
      clip-path: polygon(0 0, 100% 0, 100% 100%);
    }

    &.clippy-validations-gutter__toggle--error {
      --_clippy-gutter-flag-color: var(--basis-color-negative-border-default);
    }

    &.clippy-validations-gutter__toggle--warning {
      --_clippy-gutter-flag-color: var(--basis-color-warning-border-default);
    }

    &:hover::before,
    &:hover::after,
    &:focus-visible::before,
    &:focus-visible::after,
    &.clippy-validations-gutter__toggle--active::before,
    &.clippy-validations-gutter__toggle--active::after {
      opacity: 0.7;
    }
  }

  .clippy-validations-gutter__toggle:focus-visible {
    outline-color: var(--basis-focus-outline-color);
    outline-offset: var(--basis-focus-outline-offset);
    outline-style: var(--basis-focus-outline-style);
    outline-width: var(--basis-focus-outline-width);
  }

  .clippy-validations-gutter__meta-anchor {
    align-items: center;
    display: flex;
    inset-block: 0;
    inset-inline-end: var(--basis-space-inline-md);
    position: absolute;
    z-index: 1;
  }

  .clippy-validations-gutter__meta {
    --_clippy-gutter-severity-color: var(--basis-color-info-color-default);

    background: none;
    border-radius: var(--basis-border-radius-sm);
    border-width: var(--basis-border-width-none);
    padding-block: var(--basis-space-block-sm);
    padding-inline: var(--basis-space-inline-sm);
    column-gap: var(--basis-space-column-sm);
    display: flex;
    align-items: center;
    justify-content: flex-end;
    line-height: 1;
    cursor: pointer;
    pointer-events: auto;

    &:hover {
      outline-offset: var(--basis-size-5xs);
      outline: currentColor solid var(--basis-border-width-md);
    }

    &:focus-visible {
      outline-offset: var(--basis-focus-outline-offset);
      outline: var(--basis-focus-outline-color) var(--basis-focus-outline-style) var(--basis-focus-outline-width);
    }

    &.clippy-validations-gutter__meta--error {
      --_clippy-gutter-severity-color: var(--basis-color-negative-color-default);
    }

    &.clippy-validations-gutter__meta--warning {
      --_clippy-gutter-severity-color: var(--basis-color-warning-color-default);
    }
  }

  .clippy-validations-gutter__icon {
    display: flex;
    align-items: center;
    block-size: var(--basis-size-icon-sm);
    inline-size: var(--basis-size-icon-sm);
    color: var(--_clippy-gutter-severity-color);

    svg {
      block-size: 100%;
      inline-size: 100%;
    }
  }

  .clippy-validations-gutter__badge {
    --nl-number-badge-background-color: transparent;
    --nl-number-badge-border-width: var(--basis-border-width-none);
    --nl-number-badge-color: var(--_clippy-gutter-severity-color);
    --nl-number-badge-min-block-size: auto;
    --nl-number-badge-min-inline-size: auto;
    --nl-number-badge-padding-block: var(--basis-space-none);
    --nl-number-badge-padding-inline: var(--basis-space-none);
  }

  .clippy-validation-gutter__tooltip {
    display: none;
    position: absolute;
    inset-block-start: 0;
    inset-inline-start: var(--_clippy-gutter-rail-inline-size);
    background-color: var(--basis-color-default-bg-document);
    pointer-events: auto;
    z-index: 10;
  }
  .clippy-validation-gutter__tooltip--active {
    display: block;
  }

  @media (forced-colors: active) {
    .clippy-validations-gutter__indicator[data-scope='block']::before {
      background-color: transparent !important;
    }

    .clippy-validations-gutter__toggle::before,
    .clippy-validations-gutter__toggle::after {
      background-color: CanvasText !important;
    }

    .clippy-validations-gutter__toggle:focus-visible,
    .clippy-validations-gutter__meta:hover,
    .clippy-validations-gutter__meta:focus-visible {
      outline-color: Highlight;
    }
  }
`;
