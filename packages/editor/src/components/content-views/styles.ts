import { css } from 'lit';

export default css`
  .clippy-content-views__tabs {
    --ams-tabs-list-box-shadow: inset 0 calc(-1 * var(--basis-border-width-sm)) 0 0
      var(--basis-color-default-border-subtle);
    --ams-tabs-button-color: var(--basis-color-action-1-color-default);
    --ams-tabs-button-cursor: var(--basis-action-activate-cursor);
    --ams-tabs-button-font-family: var(--basis-text-font-family-default);
    --ams-tabs-button-font-size: var(--basis-text-font-size-md);
    --ams-tabs-button-font-weight: var(--basis-text-font-weight-default);
    --ams-tabs-button-line-height: var(--basis-text-line-height-md);
    --ams-tabs-button-outline-offset: calc(-1 * var(--basis-focus-outline-offset));
    --ams-tabs-button-padding-block: var(--basis-space-block-sm);
    --ams-tabs-button-padding-inline: var(--basis-space-inline-md);
    --ams-tabs-button-hover-box-shadow: inset 0 calc(-1 * var(--basis-border-width-sm)) 0 0 currentColor;
    --ams-tabs-button-hover-color: var(--basis-color-action-1-color-hover);
    --ams-tabs-button-selected-box-shadow: inset 0 calc(-1 * var(--basis-border-width-lg)) 0 0 currentColor;
    --ams-tabs-button-selected-font-weight: var(--basis-text-font-weight-bold);
  }

  .ams-tabs__button:focus-visible {
    outline: var(--basis-focus-outline-color) var(--basis-focus-outline-style) var(--basis-focus-outline-width);
  }

  .ams-tabs__panel {
    padding-block-start: var(--basis-space-block-lg);
  }
`;
