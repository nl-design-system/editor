import { css } from 'lit';

export default css`
  .clippy-validation-item {
    --nl-paragraph-margin-block-start: var(--basis-space-block-lg);
    --nl-paragraph-margin-block-end: var(--basis-space-block-lg);
    display: grid;
    position: relative;
    gap: var(--basis-space-inline-md);
    background-color: var(--basis-color-info-bg-document);
    border-block-start: var(--basis-border-width-md) solid var(--basis-color-info-color-default);
    min-inline-size: 320px;

    &:focus {
      outline: oklch(from var(--basis-color-info-color-subtle) l c h) solid 1px;
    }
  }

  .clippy-validation-item__title {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: var(--basis-space-inline-lg);
    background-color: var(--basis-color-info-bg-subtle);
    padding: var(--basis-space-inline-lg);
  }

  .clippy-validation-item__message {
    padding: var(--basis-space-inline-lg);
  }

  .clippy-validation-item__footer {
    padding: var(--basis-space-inline-lg);
  }

  .clippy-validation-item--warning {
    border-block-start: var(--basis-border-width-md) solid var(--basis-color-warning-color-default);

    &:focus {
      outline-color: oklch(from var(--basis-color-warning-border-default) l c h);
    }

    & .clippy-validation-item__title {
      background-color: var(--basis-color-warning-bg-subtle);
    }
  }

  .clippy-validation-item--error {
    border-block-start: var(--basis-border-width-md) solid var(--basis-color-negative-color-default);

    &:focus {
      outline-color: oklch(from var(--basis-color-negative-border-default) l c h);
    }

    & .clippy-validation-item__title {
      background-color: var(--basis-color-negative-bg-subtle);
    }
  }

  .clippy-validation-item-severity {
    color: var(--basis-color-info-color-subtle);
    &.clippy-validation-item-severity--warning {
      color: var(--basis-color-warning-border-default);
    }

    &.clippy-validation-item-severity--error {
      color: var(--basis-color-negative-border-default);
    }
  }

  .clippy-validation-item-actions {
    display: flex;
    justify-content: flex-start;
    gap: var(--basis-space-inline-md);
  }
`;
