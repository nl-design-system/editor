import { css } from 'lit';

export default css`
  :host {
    block-size: 100%;
    inset-block-start: 0;
    inset-inline-end: 0;
    position: absolute;
    align-items: flex-end;
    display: flex;
    inline-size: 1rem;
  }

  .clippy-validations-gutter__list {
    list-style: none;
    padding-inline: 0;
    inline-size: 100%;
  }

  .clippy-validations-gutter__indicator {
    block-size: 30px;
    display: block;
    cursor: pointer;
    inline-size: 100%;
    inset-inline-end: 0;
    position: absolute;
    mask-repeat: repeat;
    transition: filter 0.5s 0s;

    &::before {
      content: '';
      display: block;
      inline-size: calc(1rem / 3);
      block-size: 100%;
      inset-block-start: 0;
      inset-inline-start: 0;
      background-color: var(--ma-color-neutral-8);
      border-radius: calc(1rem / 6);
      outline: 1px solid var(--ma-color-white);
      transition: all 0.2s 0s;
      mask-image: var(--clippy-background-texture-info);
      mask-repeat: repeat;
      mask-composite: subtract;
      mask-size: 10px;
    }
    &.clippy-validations-gutter__indicator--info::before {
      mask-position: -1px;
    }
    &.clippy-validations-gutter__indicator--warning::before {
      margin-inline-start: calc(1rem / 3);
      background-color: var(--ma-color-signal-warning-700);
      mask-image: var(--clippy-background-texture-warning);
    }
    &.clippy-validations-gutter__indicator--error::before {
      margin-inline-start: calc(1rem * 2 / 3);
      background-color: var(--ma-color-signal-rood-500);
      mask-image: var(--clippy-background-texture-error);
    }
  }
  .clippy-validations-gutter__indicator:hover::before {
    transition: all 0.1s 0s;
    margin-inline-start: 0;
    inline-size: 100%;
  }
`;
