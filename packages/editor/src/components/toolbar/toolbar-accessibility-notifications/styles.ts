import { css } from 'lit';

export default css`
  :host([floating]) {
    background-color: var(--basis-color-default-bg-document, Canvas);
    bottom: var(--basis-space-block-md);
    right: var(--basis-space-inline-md);
    position: fixed;
    z-index: 2147482000;
  }

  :host([floating][floating-position^='top']) {
    bottom: auto;
    top: var(--basis-space-block-md);
  }

  :host([floating][floating-position$='left']) {
    left: var(--basis-space-inline-md);
    right: auto;
  }

  .clippy-accessibility-notifications {
    anchor-name: --clippy-notifications-trigger;
    position: relative;
  }

  .clippy-accessibility-notifications__panel {
    position: fixed;
    inset-block-start: anchor(--clippy-notifications-trigger bottom);
    inset-inline-end: anchor(--clippy-notifications-trigger right);
    position-try-fallbacks:
      flip-block,
      flip-inline,
      flip-block flip-inline;
    display: flex;
    flex-direction: column;
    min-inline-size: max-content;
    border-radius: var(--nl-button-border-radius);
    box-shadow: var(--basis-box-shadow-lg);
    background-color: var(--basis-color-default-bg-document);
    z-index: 1000;

    & .nl-button {
      --nl-button-border-radius: 0;
      inline-size: 100%;
      justify-content: flex-start;
    }
  }

  .clippy-accessibility-notifications__dot-badge {
    --clippy-notifications-dot-badge-size: var(--basis-space-inline-md);
    --clippy-notifications-dot-badge-inset: var(--basis-space-inline-sm);

    position: absolute;
    inset-block-start: var(--clippy-notifications-dot-badge-inset);
    inset-inline-end: var(--clippy-notifications-dot-badge-inset);
    inline-size: var(--clippy-notifications-dot-badge-size);
    block-size: var(--clippy-notifications-dot-badge-size);
    border-radius: var(--basis-border-radius-round);
    background-color: var(--basis-color-negative-inverse-bg-default);
    pointer-events: none;
  }
`;
