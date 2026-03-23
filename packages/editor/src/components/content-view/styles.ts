import { css } from 'lit';

export default css`
  :host {
    background-color: var(--basis-color-default-bg-document);
    display: block;
  }

  .clippy-content-view__topbar {
    align-items: center;
    background-color: var(--basis-color-neutral-bg-subtle, #f5f5f5);
    border-block-end: var(--basis-border-width-sm) solid var(--basis-color-default-border-default, #e0e0e0);
    display: flex;
    gap: var(--basis-space-inline-md, 0.5rem);
    padding-block: var(--basis-space-block-sm, 0.25rem);
    padding-inline: var(--basis-space-inline-lg, 1rem);
  }

  .clippy-content-view__container {
    padding-inline-end: var(--basis-space-inline-lg);
    position: relative;
  }

  /* Make the ProseMirror node read-only visually */
  .clippy-content [contenteditable='false'] {
    cursor: default;
    user-select: text;
  }
`;
