import { css } from 'lit';

export default css`
  :host {
    display: contents;
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
    --nl-data-badge-background-color: var(--ma-color-signal-rood-500);
    --nl-data-badge-border-color: var(--ma-color-signal-rood-500);
    --nl-data-badge-color: var(--ma-color-white);
  }

  .clippy-heading-structure__badge--warning {
    --nl-data-badge-background-color: var(--ma-color-signal-warning-700);
    --nl-data-badge-border-color: var(--ma-color-signal-warning-700);
    --nl-data-badge-color: var(--ma-color-white);
  }

  .clippy-heading-structure__badge--info {
    --nl-data-badge-background-color: var(--ma-color-neutral-8);
    --nl-data-badge-border-color: var(--ma-color-neutral-8);
    --nl-data-badge-color: var(--ma-color-white);
  }

  .clippy-heading-structure__empty {
    padding-block: var(--basis-space-block-lg);
    padding-inline: var(--basis-space-inline-xl);
  }
`;
