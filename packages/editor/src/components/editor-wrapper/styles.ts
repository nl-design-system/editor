import { css } from 'lit';

export default css`
  :host {
    display: flex;
    align-items: stretch;
  }

  ::slotted(clippy-editor-content-wrapper) {
    flex: 1 1 auto;
    min-inline-size: 0;
  }

  /* The drawer sits after the content by default (right). Its order is flipped to
     appear before the content when 'drawer-position' is 'left'. */
  ::slotted(clippy-validations-drawer) {
    order: 1;
  }

  :host([drawer-position='left']) ::slotted(clippy-validations-drawer) {
    order: -1;
  }
`;
