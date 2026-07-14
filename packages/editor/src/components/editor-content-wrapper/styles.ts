import { css } from 'lit';

export default css`
  :host {
    display: flex;
    flex-direction: column;
    min-inline-size: 0;
    box-shadow: var(--basis-box-shadow-md);
    /* Raise above the sibling drawer so the shadow on the shared edge is not
       painted over by the drawer's background. */
    position: relative;
    z-index: 1;
  }
`;
