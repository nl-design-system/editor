import { css } from 'lit';

export default css`
  :host {
    block-size: 100%;
    inset-block-start: 0;
    inset-inline: 0;
    position: absolute;
    display: block;
    pointer-events: none;
    z-index: 1;
  }

  .clippy-validations-gutter__list {
    list-style: none;
    padding-inline: 0;
    inline-size: 100%;
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
    inset-inline-end: 0;
    padding: 0;
    position: absolute;
    cursor: pointer;
    pointer-events: auto;
    transition: filter 0.5s 0s;

    &::before {
      content: '';
      display: block;
      inline-size: calc(1rem / 3);
      block-size: 100%;
      inset-block-start: 0;
      inset-inline-start: 0;
      background-color: var(--basis-color-info-color-subtle);
      border-radius: calc(1rem / 6);
      outline: 1px solid var(--basis-color-info-bg-document);
      transition: all 0.2s 0s;
    }

    &.clippy-validations-gutter__toggle--warning::before {
      margin-inline-start: calc(1rem / 3);
      background-color: var(--basis-color-warning-border-default);
    }
    &.clippy-validations-gutter__toggle--error::before {
      margin-inline-start: calc(1rem * 2 / 3);
      background-color: var(--basis-color-negative-border-default);
    }
    &:hover::before,
    &:focus-visible::before,
    &.clippy-validations-gutter__toggle--active::before {
      transition: all 0.1s 0s;
      margin-inline-start: 0;
      inline-size: 100%;
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
    .clippy-validations-gutter__toggle::before {
      background-color: CanvasText !important;
      color: Canvas !important;
    }
    .clippy-validations-gutter__indicator[data-scope='block']::before {
      background-color: transparent !important;
    }
  }
  .clippy-validation-gutter__tooltip {
    display: none;
    position: absolute;
    inset-inline-end: 1rem;
    inset-block-start: 0;
    pointer-events: auto;
    z-index: 2;
  }
  .clippy-validation-gutter__tooltip--active {
    display: block;
  }
`;
