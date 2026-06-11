import { css } from 'lit';

export default css`
  clippy-combobox {
    --utrecht-pointer-target-min-size: var(--clippy-button-small-min-block-size);
    --utrecht-textbox-padding-block-end: var(--basis-space-none);
    --utrecht-textbox-padding-block-start: var(--basis-space-none);
    --utrecht-textbox-background-color: transparent;
    --utrecht-textbox-border-width: 0;
    --utrecht-textbox-border-color: var(--nl-button-secondary-border-color);
    --utrecht-textbox-color: var(--nl-button-secondary-color);
    --utrecht-textbox-font-weight: var(--basis-text-font-weight-default);
    --utrecht-textbox-border-radius: var(--nl-button-border-radius);
    --utrecht-listbox-border-radius: var(--nl-button-border-radius);
    --utrecht-textbox-line-height: var(--basis-form-control-line-height);
  }
`;
