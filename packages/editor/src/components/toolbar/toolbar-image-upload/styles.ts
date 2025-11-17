import { css } from 'lit';

export default css`
  .clippy-toolbar-image-upload--dialog {
    max-block-size: calc(100vh - 80px);
    max-inline-size: 750px;
    border: 0;
  }
  .clippy-toolbar-image-upload--li {
    background-color: #7f7f7f;
    & img {
      max-width: 100%;
    }
  }
`;
