import { css } from 'lit';

export default css`
  :host {
    display: block;
  }

  .clippy-image-list__list {
    display: flex;
    flex-direction: column;
    gap: var(--basis-space-block-md, 1rem);
    list-style: none;
    padding-block: var(--basis-space-block-lg);
    padding-inline: var(--basis-space-inline-lg);
  }

  .clippy-image-list__item {
    border: 1px solid var(--basis-color-default-border-default, #ccc);
    border-radius: var(--basis-border-radius-md, 4px);
    display: flex;
    flex-direction: column;
    gap: var(--basis-space-block-xs, 0.25rem);
    overflow: hidden;
  }

  .clippy-image-list__item-header {
    align-items: center;
    display: flex;
    gap: var(--basis-space-inline-sm);
    padding-block: var(--basis-space-block-sm);
    padding-inline: var(--basis-space-inline-sm);
  }

  .clippy-image-list__item-header a.nl-link {
    font-weight: bold;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .clippy-image-list__thumbnail-wrapper {
    background-color: var(--basis-color-default-bg-subtle, #f5f5f5);
    display: flex;
    justify-content: center;
    padding-block: var(--basis-space-block-md);
    padding-inline: var(--basis-space-inline-md);
  }

  .clippy-image-list__thumbnail {
    block-size: auto;
    display: block;
    max-block-size: 120px;
    max-inline-size: 100%;
    object-fit: contain;
  }

  .clippy-image-list__meta {
    display: flex;
    flex-direction: column;
    gap: var(--basis-space-block-xs, 0.25rem);
    padding-block: var(--basis-space-block-sm);
    padding-inline: var(--basis-space-inline-sm);
  }

  .clippy-image-list__meta-row {
    align-items: flex-start;
    display: flex;
    flex-wrap: wrap;
    gap: var(--basis-space-inline-xs, 0.25rem);
  }

  .clippy-image-list__meta-label {
    color: var(--basis-color-default-color-subtle, #666);
    flex-shrink: 0;
    font-size: var(--basis-font-size-sm, 0.875rem);
    font-weight: bold;
  }

  .clippy-image-list__meta-value {
    color: var(--basis-color-default-color-default);
    font-size: var(--basis-font-size-sm, 0.875rem);
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-all;
  }

  .clippy-image-list__meta-value--empty {
    color: var(--basis-color-default-color-subtle, #999);
    font-style: italic;
  }

  .clippy-image-list__wcag {
    background-color: var(--basis-color-default-bg-subtle, #f9f9f9);
    border-block-start: 1px solid var(--basis-color-default-border-default, #eee);
    display: flex;
    flex-direction: column;
    gap: var(--basis-space-block-xs, 0.25rem);
    padding-block: var(--basis-space-block-sm);
    padding-inline: var(--basis-space-inline-sm);
  }

  .clippy-image-list__wcag-title {
    font-size: var(--basis-font-size-sm, 0.875rem);
    font-weight: bold;
  }

  .clippy-image-list__wcag-item {
    align-items: center;
    display: flex;
    gap: var(--basis-space-inline-xs, 0.25rem);
  }

  .clippy-image-list__wcag-status {
    display: inline-block;
    flex-shrink: 0;
    font-size: 0.75rem;
  }

  .clippy-image-list__wcag-status--pass {
    color: var(--basis-color-positive-color-default, green);
  }

  .clippy-image-list__wcag-status--fail {
    color: var(--basis-color-negative-color-default, red);
  }

  .clippy-image-list__wcag-status--warning {
    color: var(--basis-color-warning-color-default, orange);
  }

  .clippy-image-list__wcag-text {
    font-size: var(--basis-font-size-sm, 0.875rem);
  }

  .clippy-image-list__anchor-badge {
    background-color: var(--basis-color-default-bg-default, #e8f0fe);
    border: 1px solid var(--basis-color-default-border-default, #aac);
    border-radius: var(--basis-border-radius-sm, 2px);
    color: var(--basis-color-default-color-default);
    font-size: 0.75rem;
    padding-block: 0.125rem;
    padding-inline: 0.375rem;
  }

  .clippy-image-list__badge--error {
    --nl-data-badge-background-color: var(--basis-color-negative-bg-default);
    --nl-data-badge-border-color: var(--basis-color-negative-border-default);
    --nl-data-badge-color: var(--basis-color-negative-color-default);
  }

  .clippy-image-list__badge--warning {
    --nl-data-badge-background-color: var(--basis-color-warning-bg-default);
    --nl-data-badge-border-color: var(--basis-color-warning-border-default);
    --nl-data-badge-color: var(--basis-color-warning-color-default);
  }

  .clippy-image-list__badge--info {
    --nl-data-badge-background-color: var(--basis-color-default-bg-default);
    --nl-data-badge-border-color: var(--basis-color-default-border-default);
    --nl-data-badge-color: var(--basis-color-default-color-default);
  }

  .clippy-image-list__empty {
    padding-block: var(--basis-space-block-lg);
    padding-inline: var(--basis-space-inline-xl);
  }

  .clippy-image-list__src {
    color: var(--basis-color-default-color-subtle, #666);
    font-size: var(--basis-font-size-sm, 0.875rem);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

