import { css } from 'lit';

export default css`
  :host {
    display: flex;
    flex-wrap: wrap;
    align-items: stretch;
  }

  ::slotted(clippy-editor-content-wrapper) {
    flex: 1 1 20rem;
    min-inline-size: 0;
  }

  /* The drawer sits after the content by default (right). Its order is flipped to
     appear before the content when 'drawer-position' is 'left'. When it no longer
     fits beside the content, it wraps below it: plain 'wrap' does so for the last
     item, 'wrap-reverse' for the first. */
  ::slotted(clippy-validations-drawer) {
    order: 1;
  }

  :host([drawer-position='left']) {
    flex-wrap: wrap-reverse;
  }

  :host([drawer-position='left']) ::slotted(clippy-validations-drawer) {
    order: -1;
  }
`;
