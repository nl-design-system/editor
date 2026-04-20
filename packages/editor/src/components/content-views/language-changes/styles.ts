import { css } from 'lit';

export default css`
  :host {
    --nl-data-badge-min-inline-size: initial;
    display: block;
  }

  .clippy-language-changes__list {
    display: flex;
    flex-direction: column;
    gap: var(--basis-space-block-sm);
    list-style: none;
    padding-block: var(--basis-space-block-lg);
    padding-inline: var(--basis-space-inline-lg);
  }

  .clippy-language-changes__item {
    align-items: baseline;
    display: flex;
    gap: var(--basis-space-inline-sm);
  }

  .clippy-language-changes__item-content {
    display: flex;
    flex-direction: column;
    gap: var(--basis-space-block-xs, 0.125rem);
  }

  .clippy-language-changes__doc-label {
    color: var(--basis-color-default-color-subtle, #666);
    font-size: var(--basis-font-size-sm, 0.875rem);
  }

  .clippy-language-changes__empty {
    padding-block: var(--basis-space-block-lg);
    padding-inline: var(--basis-space-inline-xl);
  }
`;
