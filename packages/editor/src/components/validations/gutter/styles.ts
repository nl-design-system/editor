import { css } from 'lit';

export default css`
  :host {
    block-size: 100%;
    inset-block-start: 0;
    inset-inline: 0;
    position: absolute;
    display: block;
    pointer-events: none;
  }

  .clippy-validations-gutter__list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .clippy-validations-gutter__indicator {
    block-size: 30px;
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
    border: none;
    block-size: 100%;
    inline-size: 1rem;
    inset-block-start: 0;
    inset-inline-start: 0;
    padding: 0;
    position: absolute;
    cursor: pointer;
    pointer-events: auto;
    z-index: 1;

    &::before {
      content: '';
      position: absolute;
      inset-block-start: 0;
      inset-inline-start: 0;
      block-size: 100%;
      inline-size: 2px;
      border-end-end-radius: 1px;
      border-end-start-radius: 1px;
      transition: opacity 0.2s;
    }

    &::after {
      content: '';
      position: absolute;
      inset-block-start: 0;
      inset-inline-start: 0;
      block-size: 8px;
      inline-size: 8px;
      clip-path: polygon(0 0, 100% 0, 0 100%);
      transition: opacity 0.2s;
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
    .clippy-validations-gutter__meta:hover,
    .clippy-validations-gutter__meta:focus-visible {
      outline-color: Highlight;
    }
    .clippy-validations-gutter__indicator[data-scope='block']::before {
      background-color: transparent !important;
    }
  }
  .clippy-validations-gutter__meta-anchor {
    position: absolute;
    inset-block-start: 50%;
    inset-inline-end: var(--basis-space-inline-md);
    transform: translateY(-50%);
    pointer-events: auto;
    z-index: 1;
  }

  .clippy-validations-gutter__meta {
    background: none;
    border: none;
    border-radius: var(--basis-border-radius-sm);
    padding: var(--basis-space-inline-sm);
    display: flex;
    align-items: center;
    line-height: 1;
    cursor: pointer;
    pointer-events: auto;

    &:hover {
      outline: 2px solid currentColor;
      outline-offset: 2px;
    }
    &:focus-visible {
      outline: 2px solid Highlight;
      outline-offset: 1px;
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

  .clippy-validations-gutter__badge--error {
    --nl-number-badge-background-color: var(--basis-color-negative-bg-default);
    --nl-number-badge-color: var(--basis-color-negative-color-default);
  }
  .clippy-validations-gutter__badge--warning {
    --nl-number-badge-background-color: var(--basis-color-warning-bg-default);
    --nl-number-badge-color: var(--basis-color-warning-color-default);
  }
  .clippy-validations-gutter__badge--info {
    --nl-number-badge-background-color: var(--basis-color-info-bg-default);
    --nl-number-badge-color: var(--basis-color-info-color-default);
  }

  .clippy-validation-gutter__tooltip {
    display: none;
    position: absolute;
    inset-block-start: 0;
    inset-inline-start: 1rem;
    background-color: var(--basis-color-default-bg-document);
    pointer-events: auto;
    z-index: 10;
  }
  .clippy-validation-gutter__tooltip--active {
    display: block;
  }
`;
