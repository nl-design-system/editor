import { css } from 'lit';

export default css`
  :host {
    display: contents;
    --nl-data-badge-min-inline-size: initial;
  }

  .clippy-heading-structure__dialog {
    --utrecht-drawer-z-index: 10;
  }

  .clippy-heading-structure__header {
    align-items: center;
    border-block-end: 1px solid var(--basis-color-default-border-default);
    display: flex;
    gap: var(--basis-space-inline-md);
    inset-block-start: 0;
    justify-content: space-between;
    padding-block: var(--basis-space-block-lg);
    padding-inline: var(--basis-space-inline-xl);
    position: sticky;
    z-index: 1;
  }

  .clippy-heading-structure__list {
    display: flex;
    flex-direction: column;
    gap: var(--basis-space-block-sm);
    list-style: none;
    padding-block: var(--basis-space-block-lg);
    padding-inline: var(--basis-space-inline-lg);
  }

  .clippy-heading-structure__item {
    align-items: baseline;
    display: flex;
    gap: var(--basis-space-inline-sm);
  }

  .clippy-heading-structure__item[data-level='2'] {
    padding-inline-start: var(--basis-space-inline-lg);
  }
  .clippy-heading-structure__item[data-level='3'] {
    padding-inline-start: calc(2 * var(--basis-space-inline-lg));
  }
  .clippy-heading-structure__item[data-level='4'] {
    padding-inline-start: calc(3 * var(--basis-space-inline-lg));
  }
  .clippy-heading-structure__item[data-level='5'] {
    padding-inline-start: calc(4 * var(--basis-space-inline-lg));
  }
  .clippy-heading-structure__item[data-level='6'] {
    padding-inline-start: calc(5 * var(--basis-space-inline-lg));
  }

  .clippy-heading-structure__badge--error {
    --nl-data-badge-background-color: var(--basis-color-negative-bg-default);
    --nl-data-badge-border-color: var(--basis-color-negative-border-default);
    --nl-data-badge-color: var(--basis-color-negative-color-default);
  }

  .clippy-heading-structure__badge--warning {
    --nl-data-badge-background-color: var(--basis-color-warning-bg-default);
    --nl-data-badge-border-color: var(--basis-color-warning-border-default);
    --nl-data-badge-color: var(--basis-color-warning-color-default);
  }

  .clippy-heading-structure__badge--info {
    --nl-data-badge-background-color: var(--basis-color-default-bg-default);
    --nl-data-badge-border-color: var(--basis-color-default-border-default);
    --nl-data-badge-color: var(--basis-color-default-color-default);
  }

  .clippy-heading-structure__empty {
    padding-block: var(--basis-space-block-lg);
    padding-inline: var(--basis-space-inline-xl);
  }
`;
