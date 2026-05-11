import { css } from 'lit';

export default css`
  :host {
    block-size: 100%;
    display: flex;
    flex-direction: row;
    inline-size: 100%;
    min-block-size: 0;
    overflow: hidden;
  }

  .clippy-editor-wrapper__main {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-inline-size: 0;
    overflow-y: auto;
    padding-block: var(--clippy-editor-wrapper-padding-block, 0);
    padding-inline: var(--clippy-editor-wrapper-padding-inline, 0);
  }
`;
