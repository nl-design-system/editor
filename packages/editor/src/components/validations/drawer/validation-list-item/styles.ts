import { css } from 'lit';

export default css`
  .clippy-dialog__list-item {
    display: grid;
    position: relative;
    gap: var(--basis-space-inline-md);
    background-color: white;
    border: 1px solid var(--ma-color-neutral-8);
    padding-block: 1rem;
    padding-inline: 2rem 1rem;
    min-inline-size: 250px;
    border-radius: 1rem;

    &:focus {
      outline: oklch(from var(--ma-color-neutral-8) l c h) solid 1px;
    }
  }

  .clippy-dialog__list-item::after {
    content: '';
    position: absolute;
    display: block;
    inset-inline-start: 0;
    inset-block-start: 0;
    height: 100%;
    width: 1rem;
    border-radius: 1rem 0 0 1rem;
    background-color: var(--ma-color-neutral-8);
    mask-image: var(--clippy-background-texture-info);
    mask-repeat: repeat;
    mask-composite: subtract;
    mask-size: 10px;
  }

  .clippy-dialog__list-item--warning {
    border: 1px solid var(--ma-color-signal-warning-700);

    &:focus {
      outline-color: oklch(from var(--ma-color-signal-warning-700) l c h);
    }

    &::after {
      background-color: var(--ma-color-signal-warning-700);
      mask-image: var(--clippy-background-texture-warning);
    }
  }

  .clippy-dialog__list-item--error {
    border: 1px solid var(--ma-color-signal-rood-500);

    &:focus {
      outline-color: oklch(from var(--ma-color-signal-rood-500) l c h);
    }

    &::after {
      background-color: var(--ma-color-signal-rood-500);
      mask-image: var(--clippy-background-texture-error);
    }
  }

  .clippy-dialog__list-item-message {
    display: flex;
    justify-content: space-between;
    gap: var(--basis-space-inline-sm);
  }

  .clippy-dialog__list-item-tip {
  }

  .clippy-dialog__list-item-severity {
    color: var(--ma-color-neutral-8);
    &.clippy-dialog__list-item-severity--warning {
      color: var(--ma-color-signal-warning-700);
    }

    &.clippy-dialog__list-item-severity--error {
      color: var(--ma-color-signal-rood-500);
    }
  }

  .clippy-dialog__list-item-actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--basis-space-inline-md);
  }
`;
