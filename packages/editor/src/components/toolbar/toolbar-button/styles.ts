import { css } from 'lit';

export default css`
  .clippy-nl-button--small {
    --nl-button-min-inline-size: 32px;
    --nl-button-min-block-size: 32px;
    --nl-button-icon-size: 18px;
  }

  .clippy-nl-button--small ::slotted([slot='iconStart']),
  .clippy-nl-button--small ::slotted([slot='iconEnd']) {
    height: var(--nl-button-icon-size);
    width: var(--nl-button-icon-size);
  }
`;
