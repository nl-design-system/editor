import { css } from 'lit';

export default css`
  :host {
    display: block;
  }

  .clippy-link-list__list {
    display: flex;
    flex-direction: column;
    gap: var(--basis-space-block-xl);
    list-style: none;
    padding-block: var(--basis-space-block-lg);
    padding-inline: var(--basis-space-inline-lg);
  }

  .clippy-link-list__item {
    align-items: center;
    background-color: var(--basis-color-default-bg-subtle);
    border-block-start: var(--basis-border-width-md) solid var(--basis-color-default-border-default);
    display: flex;
    gap: var(--basis-space-inline-lg);
    justify-content: space-between;
    padding: var(--basis-space-inline-lg);

    &.clippy-link-list__item--info {
      background-color: var(--basis-color-info-bg-subtle);
      border-block-start-color: var(--basis-color-info-color-default);
    }

    &.clippy-link-list__item--warning {
      background-color: var(--basis-color-warning-bg-subtle);
      border-block-start-color: var(--basis-color-warning-color-default);
    }

    &.clippy-link-list__item--error {
      background-color: var(--basis-color-negative-bg-subtle);
      border-block-start-color: var(--basis-color-negative-color-default);
    }
  }

  .clippy-link-list__item-content {
    display: flex;
    flex-direction: column;
    gap: var(--basis-space-block-xs);
    min-inline-size: 0;
  }

  .clippy-link-list__href {
    color: var(--basis-color-default-color-subtle, #666);
    font-size: var(--basis-font-size-sm, 0.875rem);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .clippy-link-list__intro {
    padding-block-start: var(--basis-space-block-lg);
    padding-inline: var(--basis-space-inline-lg);

    .nl-heading {
      margin-block: var(--basis-space-none);
    }
  }

  .clippy-link-list__guideline {
    align-items: start;
    display: flex;
    flex-direction: column;
    gap: var(--basis-space-block-md);
    padding-inline: var(--basis-space-inline-lg);

    .nl-paragraph {
      margin-block: var(--basis-space-none);
    }
  }

  .clippy-link-list__empty {
    padding-block: var(--basis-space-block-lg);
    padding-inline: var(--basis-space-inline-xl);
  }
`;
