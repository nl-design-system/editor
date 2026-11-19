import { css } from 'lit';

export default css`
  :host {
    --nl-data-badge-min-inline-size: initial;
    --nl-button-column-gap: var(--basis-space-inline-sm);
    --nl-button-padding-block-start: var(--basis-space-block-sm);
    --nl-button-padding-block-end: var(--basis-space-block-sm);
    --nl-button-padding-inline-start: var(--basis-space-block-sm);
    --nl-button-padding-inline-end: var(--basis-space-block-sm);
    --nl-button-min-block-size: initial;
    display: block;
  }
  @media (prefers-reduced-motion: no-preference) {
    :host {
      scroll-behavior: smooth;
    }
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
    align-items: center;
    display: flex;
    gap: var(--basis-space-inline-sm);
    min-inline-size: 0;
  }

  .clippy-heading-structure__button {
    align-items: baseline;
    display: flex;
    inline-size: 100%;
    justify-content: start;
    min-inline-size: 0;
    text-align: start;
    text-box-trim: none;
  }

  .clippy-heading-structure__button .nl-data-badge {
    flex-shrink: 0;
  }

  .clippy-heading-structure__text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-inline-size: 0;
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

  .clippy-heading-structure__button--error {
    --nl-button-subtle-active-color: var(--basis-color-negative-color-active);
    --nl-button-subtle-color: var(--basis-color-negative-color-default);
    --nl-button-subtle-hover-color: var(--basis-color-negative-color-hover);
  }

  .clippy-heading-structure__button--warning {
    --nl-button-subtle-active-color: var(--basis-color-warning-color-active);
    --nl-button-subtle-color: var(--basis-color-warning-color-default);
    --nl-button-subtle-hover-color: var(--basis-color-warning-color-hover);
  }

  .clippy-heading-structure__button--info {
    --nl-button-subtle-active-color: var(--basis-color-info-color-active);
    --nl-button-subtle-color: var(--basis-color-info-color-default);
    --nl-button-subtle-hover-color: var(--basis-color-info-color-hover);
  }

  .clippy-heading-structure__intro {
    padding-block-start: var(--basis-space-block-lg);
    padding-inline: var(--basis-space-inline-lg);

    .nl-heading {
      margin-block: var(--basis-space-none);
    }
  }

  .clippy-heading-structure__guideline {
    align-items: start;
    display: flex;
    flex-direction: column;
    gap: var(--basis-space-block-md);
    padding-inline: var(--basis-space-inline-lg);

    .nl-paragraph {
      margin-block: var(--basis-space-none);
    }
  }

  .clippy-heading-structure__empty {
    padding-block: var(--basis-space-block-lg);
    padding-inline: var(--basis-space-inline-xl);
  }
`;
