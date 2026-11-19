import { css } from 'lit';

export default css`
  :host([hidden]) {
    display: none;
  }

  .clippy-validations-view__filters {
    padding-block-end: var(--basis-space-block-lg);
  }
`;
