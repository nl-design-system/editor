import { css } from 'lit';

export default css`
  .clippy-guideline {
    --utrecht-space-around: 0;
    --utrecht-code-font-size: 16px;

    border: 1px solid var(--basis-color-default-border-default);
    margin-block-end: 40px;
    margin-block-start: 0; /* reset <figure> margin */
    margin-inline-start: 0; /* reset <figure> margin */
    margin-inline-end: 0; /* reset <figure> margin */
  }

  .clippy-guideline:first-of-type {
    margin-block-start: var(--basis-space-block-3xl);
  }
  p + .clippy-guideline {
    margin-block-start: var(--basis-space-block-3xl);
  }

  .clippy-guideline + .clippy-guideline {
    margin-block-start: -var(--basis-space-block-3xl);
  }

  .clippy-guideline__description {
    padding: 24px;
  }

  .clippy-guideline__example {
    border-block-width: 1px;
    border-inline-width: 0;
    border-style: solid;
    border-color: var(--basis-color-default-border-default);
  }

  .clippy-guideline select {
    display: block;
    margin-bottom: 0.5em;
  }

  .clippy-guideline__icon {
    height: 20px;
    margin-inline-end: 8px;
    vertical-align: middle;
    width: 20px;
  }

  .clippy-guideline__title {
    vertical-align: middle;
  }

  .clippy-guideline__badge {
    margin-block-start: 0;
    margin-block-end: 0;
    --utrecht-paragraph-font-weight: bold;

    font-size: var(--basis-text-font-size-lg);
    margin-block-end: var(--basis-space-block-xl);
  }

  .clippy-guideline span.progress-indicator {
    display: block;
    font-size: var(--basis-text-font-size-md);
    font-weight: normal;
  }

  .clippy-guideline__badge--negative {
    --utrecht-paragraph-color: currentColor;
    color: var(--basis-color-negative-color-default);
  }

  .clippy-guideline__badge--positive {
    --utrecht-paragraph-color: currentColor;
    color: var(--basis-color-positive-color-default);
  }

  .clippy-guideline--negative {
    --nlds-canvas-toolbar-copy-display: none;
    --nlds-canvas-code-block-cursor: not-allowed;
    --nlds-canvas-code-block-user-select: none;
  }
  .clippy-guideline__subtitle {
    display: none;
  }
  .clippy-guideline__example [contenteditable] {
    /* Add a border to contain the margins, and have the focus ring align nicely */
    border-block-start: 1px solid transparent;
    border-block-end: 1px solid transparent;

    padding-inline-start: var(--basis-space-inline-md);
    padding-inline-end: var(--basis-space-inline-md);
  }
`;
