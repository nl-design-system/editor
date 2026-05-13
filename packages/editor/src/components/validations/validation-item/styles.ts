import { css } from 'lit';

export default css`
  .clippy-dialog__list-item {
    display: grid;
    position: relative;
    gap: var(--basis-space-inline-md);
    background-color: var(--basis-color-default-bg-document);
    border: 1px solid var(--basis-color-default-color-subtle);
    padding-block: 1rem;
    padding-inline: 2rem 1rem;
    min-inline-size: 320px;
    border-radius: 1rem;

    &:focus {
      outline: oklch(from var(--basis-color-default-color-subtle) l c h) solid 1px;
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
    background-color: var(--basis-color-default-color-subtle);
    mask-image: var(--clippy-background-texture-info);
    mask-repeat: repeat;
    mask-composite: subtract;
    mask-size: 10px;
  }

  .clippy-dialog__list-item--warning {
    border: 1px solid var(--basis-color-warning-border-default);

    &:focus {
      outline-color: oklch(from var(--basis-color-warning-border-default) l c h);
    }

    &::after {
      background-color: var(--basis-color-warning-border-default);
      mask-image: var(--clippy-background-texture-warning);
    }
  }

  .clippy-dialog__list-item--error {
    border: 1px solid var(--basis-color-negative-border-default);

    &:focus {
      outline-color: oklch(from var(--basis-color-negative-border-default) l c h);
    }

    &::after {
      background-color: var(--basis-color-negative-border-default);
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
    color: var(--basis-color-default-color-subtle);
    &.clippy-dialog__list-item-severity--warning {
      color: var(--basis-color-warning-border-default);
    }

    &.clippy-dialog__list-item-severity--error {
      color: var(--basis-color-negative-border-default);
    }
  }

  .clippy-dialog__list-item-actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--basis-space-inline-md);
  }
`;
