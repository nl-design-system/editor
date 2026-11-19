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

  .clippy-language-changes__item,
  .clippy-language-changes__document-language {
    align-items: center;
    background-color: var(--basis-color-default-bg-subtle);
    display: flex;
    gap: var(--basis-space-inline-lg);
    padding: var(--basis-space-inline-lg);
  }

  .clippy-language-changes__document-language {
    margin-block: var(--basis-space-block-lg) var(--basis-space-none);
    margin-inline: var(--basis-space-inline-lg);
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

  .clippy-language-changes__intro {
    align-items: start;
    display: flex;
    flex-direction: column;
    gap: var(--basis-space-block-md);
    padding-block-start: var(--basis-space-block-lg);
    padding-inline: var(--basis-space-inline-lg);

    .nl-heading,
    .nl-paragraph {
      margin-block: var(--basis-space-none);
    }
  }

  .clippy-language-changes__empty {
    padding-block: var(--basis-space-block-lg);
    padding-inline: var(--basis-space-inline-xl);
  }
`;
