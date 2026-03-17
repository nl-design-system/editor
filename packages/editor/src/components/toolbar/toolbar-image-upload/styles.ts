import { css } from 'lit';

export const imageDialogStyles = css`
  .toolbar-image__preview {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--basis-space-block-md);
    border: 2px solid var(--ma-color-paars-8);
    margin-block-end: var(--basis-space-block-sm);
    background-color: var(--basis-color-default-background-subtle, #f5f5f5);
    min-block-size: 80px;
  }

  .toolbar-image__preview-img {
    max-inline-size: 100%;
    max-block-size: 200px;
    object-fit: contain;
  }

  .toolbar-image__source-row {
    display: flex;
    gap: var(--basis-space-inline-sm);
    align-items: center;
  }

  .toolbar-image__source-row .utrecht-textbox {
    flex: 1;
  }

  .toolbar-image__dimensions-fieldset {
    border: 1px solid var(--basis-color-default-border-default);
    padding: var(--basis-space-block-md) var(--basis-space-inline-lg);
    margin-block-start: var(--basis-space-block-lg);
  }

  .toolbar-image__dimensions-legend {
    font-weight: bold;
    padding-inline: var(--basis-space-inline-sm);
  }

  .toolbar-image__dimensions-row {
    display: flex;
    gap: var(--basis-space-inline-md);
    align-items: flex-end;
  }

  .toolbar-image__dimensions-row .utrecht-form-field {
    flex: 1;
  }

  .toolbar-image__actions {
    display: flex;
    gap: 0.625rem;
    justify-content: flex-end;
    margin-block-start: var(--basis-space-block-xl);
    padding-block-start: var(--basis-space-block-xl);
    border-top: 1px solid var(--basis-color-default-border-default);
  }
`;
