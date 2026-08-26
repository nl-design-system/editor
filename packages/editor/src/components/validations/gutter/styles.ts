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
    block-size: var(--basis-size-xs);
    inline-size: 100%;
    inset-inline-start: 0;
    position: absolute;

    &[data-scope='block']::before {
      content: '';
      position: absolute;
      inset-block-start: 0;
      inset-inline-start: 0;
      block-size: 100%;
      inline-size: 100%;
      pointer-events: none;
      z-index: -1;
    }

    &[data-scope='block'][data-severity='error']::before {
      background-color: color-mix(in srgb, var(--basis-color-negative-bg-default), transparent 50%);
    }

    &[data-scope='block'][data-severity='warning']::before {
      background-color: color-mix(in srgb, var(--basis-color-warning-bg-default), transparent 50%);
    }

    &[data-scope='block'][data-severity='info']::before {
      background-color: color-mix(in srgb, var(--basis-color-info-bg-default), transparent 50%);
    }
  }

  .clippy-validations-gutter__toggle {
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
      transition: opacity 0.2s;
    }

    /* clip-path has no logical form, so mirror the flag for right-to-left. */

    &:dir(rtl)::after {
      clip-path: polygon(0 0, 100% 0, 100% 100%);
    }

    &.clippy-validations-gutter__toggle--error::before,
    &.clippy-validations-gutter__toggle--error::after {
      background-color: var(--basis-color-negative-border-default);
    }

    &.clippy-validations-gutter__toggle--warning::before,
    &.clippy-validations-gutter__toggle--warning::after {
      background-color: var(--basis-color-warning-border-default);
    }

    &.clippy-validations-gutter__toggle--info::before,
    &.clippy-validations-gutter__toggle--info::after {
      background-color: var(--basis-color-info-border-default);
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
  }

  .clippy-validations-gutter__icon {
    display: flex;
    align-items: center;
    block-size: var(--basis-size-icon-sm);
    inline-size: var(--basis-size-icon-sm);

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

  .clippy-validations-gutter__badge {
    --nl-number-badge-background-color: transparent;
    --nl-number-badge-border-width: var(--basis-border-width-none);
    --nl-number-badge-min-block-size: auto;
    --nl-number-badge-min-inline-size: auto;
    --nl-number-badge-padding-block: var(--basis-space-none);
    --nl-number-badge-padding-inline: var(--basis-space-none);
  }

  .clippy-validations-gutter__badge--error {
    --nl-number-badge-color: var(--basis-color-negative-color-default);
  }
  .clippy-validations-gutter__badge--warning {
    --nl-number-badge-color: var(--basis-color-warning-color-default);
  }
  .clippy-validations-gutter__badge--info {
    --nl-number-badge-color: var(--basis-color-info-color-default);
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
