import { css } from 'lit';

export default css`
  :host {
    --nl-data-badge-min-inline-size: initial;
    display: block;
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
