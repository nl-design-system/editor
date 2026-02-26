import { css } from 'lit';

export const linkDialogStyles = css`
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
