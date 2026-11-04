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
    min-inline-size: min(320px, 100%);

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

  /* The documentation ships its lists with Amsterdam's class, which no NL Design System package covers. */
  .ams-unordered-list {
    margin-block: var(--basis-space-block-md);
    padding-inline-start: var(--basis-space-inline-xl);
    list-style-type: disc;
  }

  .ams-unordered-list__item {
    margin-block-end: var(--basis-space-block-sm);
  }

  .clippy-validation-item__links {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: var(--basis-space-inline-md);
    margin-block-start: var(--basis-space-block-lg);
  }

  .clippy-validation-item__extensive-explanation {
    align-items: center;
    display: inline-flex;
    gap: var(--basis-space-inline-sm);

    & clippy-icon {
      flex-shrink: 0;
    }
  }

  .clippy-validation-item-actions {
    display: flex;
    justify-content: flex-start;
    gap: var(--basis-space-inline-md);
  }

  .clippy-validation-item__corrections {
    display: flex;
    gap: var(--basis-space-inline-xs);
    position: relative;
  }

  .clippy-validation-item__corrections-menu {
    background-color: var(--basis-color-default-bg-document);
    border-color: var(--basis-color-default-border-default);
    border-radius: var(--basis-border-radius-md);
    border-style: solid;
    border-width: var(--basis-border-width-sm);
    box-shadow: var(--basis-box-shadow-md);
    display: flex;
    flex-direction: column;
    inset-block-start: 100%;
    inset-inline-start: 0;
    margin-block-start: var(--basis-space-block-xs);
    min-inline-size: 100%;
    padding-block: var(--basis-space-block-xs);
    position: absolute;
    z-index: 1;
  }

  .clippy-validation-item__corrections-menu-item {
    border-radius: 0;
    inline-size: 100%;
    justify-content: flex-start;
    white-space: nowrap;
  }
`;
