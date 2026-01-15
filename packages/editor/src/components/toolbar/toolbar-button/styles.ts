import { css } from 'lit';

export default css`
  .clippy-nl-button--small {
    --nl-button-min-inline-size: var(--clippy-nl-button-small-min-inline-size, 32px);
    --nl-button-min-block-size: var(--clippy-nl-button-small-min-block-size, 32px);
    --nl-button-icon-size: var(--clippy-nl-button-small-icon, 18px);
  }

  /*
   Only direct slotted children can be styled with ::slotted(). The SVG can only be styled when it has the slot attribute
   See: https://lit.dev/docs/components/styles/#slotted
  */
  .clippy-nl-button--small ::slotted([slot='iconStart']),
  .clippy-nl-button--small ::slotted([slot='iconEnd']) {
    height: var(--nl-button-icon-size);
    width: var(--nl-button-icon-size);
  }
`;
