import { css } from 'lit';

export default css`
  :host {
    display: block;
  }

  .clippy-link-list__list {
    display: flex;
    flex-direction: column;
    gap: var(--basis-space-block-sm);
    list-style: none;
    padding-block: var(--basis-space-block-lg);
    padding-inline: var(--basis-space-inline-lg);
  }

  .clippy-link-list__item {
    display: flex;
    flex-direction: column;
    gap: var(--basis-space-block-xs, 0.125rem);
  }

  .clippy-link-list__item-header {
    align-items: baseline;
    display: flex;
    gap: var(--basis-space-inline-sm);
  }

  .clippy-link-list__href {
    color: var(--basis-color-default-color-subtle, #666);
    font-size: var(--basis-font-size-sm, 0.875rem);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .clippy-link-list__badge--error {
    --nl-data-badge-background-color: var(--basis-color-negative-bg-default);
    --nl-data-badge-border-color: var(--basis-color-negative-border-default);
    --nl-data-badge-color: var(--basis-color-negative-color-default);
  }

  .clippy-link-list__badge--warning {
    --nl-data-badge-background-color: var(--basis-color-warning-bg-default);
    --nl-data-badge-border-color: var(--basis-color-warning-border-default);
    --nl-data-badge-color: var(--basis-color-warning-color-default);
  }

  .clippy-link-list__badge--info {
    --nl-data-badge-background-color: var(--basis-color-default-bg-default);
    --nl-data-badge-border-color: var(--basis-color-default-border-default);
    --nl-data-badge-color: var(--basis-color-default-color-default);
  }

  .clippy-link-list__empty {
    padding-block: var(--basis-space-block-lg);
    padding-inline: var(--basis-space-inline-xl);
  }
`;
