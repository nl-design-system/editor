import { css } from 'lit';

export default css`
  :host {
    display: contents;
  }

  .clippy-content-views-dialog__dialog {
    --utrecht-drawer-z-index: 10;
  }

  /* ── Topbar (lives inside the dialog) ── */
  .clippy-content-views-dialog__topbar {
    align-items: center;
    background-color: var(--basis-color-neutral-bg-subtle, #f5f5f5);
    border-block-end: var(--basis-border-width-sm, 1px) solid var(--basis-color-default-border-default, #e0e0e0);
    display: flex;
    gap: var(--basis-space-inline-md, 0.5rem);
    inset-block-start: 0;
    justify-content: space-between;
    padding-block: var(--basis-space-block-sm, 0.25rem);
    padding-inline: var(--basis-space-inline-lg, 1rem);
    position: sticky;
    z-index: 1;
  }

  .clippy-content-views-dialog__modes {
    display: flex;
    gap: var(--basis-space-inline-sm, 0.25rem);
  }
`;
