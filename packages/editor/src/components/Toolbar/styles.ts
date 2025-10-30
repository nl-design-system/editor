import { css } from 'lit';

export default css`
  .clippy-toolbar__wrapper {
    display: flex;
    gap: var(--basis-space-inline-sm);
    background-color: var(--ma-color-paars-1);
    border: 1px solid var(--ma-color-paars-8);
    border-radius: 3px;
    padding-block: var(--basis-space-inline-md);
    padding-inline: var(--basis-space-inline-md);
  }

  .clippy-toolbar__divider {
    inline-size: 2px;
    margin-inline: var(--basis-space-inline-sm);
    background: var(--ma-color-paars-8);
  }
`;
