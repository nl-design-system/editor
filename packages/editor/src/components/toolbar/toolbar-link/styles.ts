import { css } from 'lit';

export const linkDialogStyles = css`
  .toolbar-link__preview {
    display: inline-flex;
    align-items: center;
    gap: var(--basis-space-inline-lg);
    padding-inline: var(--basis-space-inline-lg);
    padding-block: var(--basis-space-block-md);
    border: 2px solid var(--ma-color-paars-8);
    margin-block-end: var(--basis-space-block-sm);
  }

  .toolbar-link__preview-text {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .toolbar-link__preview-icon {
    flex-shrink: 0;
    color: var(--basis-color-default-border-default);
  }

  .toolbar-link__actions {
    display: flex;
    gap: 0.625rem;
    justify-content: flex-end;
    margin-block-start: var(--basis-space-block-xl);
    padding-block-start: var(--basis-space-block-xl);
    border-top: 1px solid var(--basis-color-default-border-default);
  }

  .ams-dialog__footer {
    display: none;
  }
`;
