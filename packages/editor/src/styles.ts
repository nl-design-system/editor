import { css } from 'lit';

export default css`
  :host {
    background-color: var(--basis-color-default-bg-document);
    display: flex;
    flex-direction: column;
    inline-size: 100%;
    margin-inline: auto;
    max-inline-size: var(--clippy-editor-max-inline-size, 900px);
    min-block-size: 100%;
  }

  .clippy-editor-main {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-inline-size: 0;
    overflow: hidden;
  }

  .clippy-editor-body {
    display: flex;
    flex: 1;
    flex-direction: row;
    min-block-size: 0;
    overflow: hidden;
  }

  .ProseMirror-selectednode {
    anchor-name: --bubble-menu;
    display: inline-block !important;
  }
  .clippy-bubble-menu {
    position-anchor: --bubble-menu;
    position-area: top center;
  }
  .clippy-editor-container {
    flex: 1;
    min-inline-size: 0;
    overflow-y: auto;
    position: relative;
  }

  p.is-editor-empty:first-child::before {
    color: var(--basis-color-default-color-subtle);
    content: attr(data-placeholder);
    float: left;
    height: 0;
    pointer-events: none;
  }

  .clippy-content {
    padding-block: var(--basis-space-inline-lg);
    padding-inline: var(--basis-space-inline-lg);
  }

  .clippy-content:focus-visible {
    outline-style: dashed;
    outline-color: var(--basis-color-accent-1-border-default);
    outline-offset: -1px;
  }

  img {
    height: auto;
    max-width: 100%;

    &.ProseMirror-selectednode {
      outline: 3px solid var(--basis-color-accent-1-border-default);
    }
  }

  .clippy-content[contenteditable='false'] img.ProseMirror-selectednode {
    outline: none;
  }

  [data-resizer] {
    background-color: transparent;
  }

  .ProseMirror-selectednode {
    [data-resize-handle] {
      position: absolute;
      background: var(--basis-color-accent-1-border-default);
      border: 1px solid rgba(255, 255, 255, 0.8);
      border-radius: var(--basis-border-radius-sm);
      z-index: 10;

      &:hover {
        background: rgba(0, 0, 0, 0.8);
      }
    }

    /* Corner handles */

    [data-resize-handle='top-left'],
    [data-resize-handle='top-right'],
    [data-resize-handle='bottom-left'],
    [data-resize-handle='bottom-right'] {
      width: 18px;
      height: 18px;
    }

    [data-resize-handle='top-left'] {
      top: -9px;
      left: -9px;
      cursor: nwse-resize;
    }

    [data-resize-handle='top-right'] {
      top: -4px;
      right: -4px;
      cursor: nesw-resize;
    }

    [data-resize-handle='bottom-left'] {
      bottom: -4px;
      left: -4px;
      cursor: nesw-resize;
    }

    [data-resize-handle='bottom-right'] {
      bottom: -4px;
      right: -4px;
      cursor: nwse-resize;
    }

    /* Edge handles */

    [data-resize-handle='top'],
    [data-resize-handle='bottom'] {
      height: 3px;
      left: 8px;
      right: 8px;
    }

    [data-resize-handle='top'] {
      top: -3px;
      cursor: ns-resize;
    }

    [data-resize-handle='bottom'] {
      bottom: -3px;
      cursor: ns-resize;
    }

    [data-resize-handle='left'],
    [data-resize-handle='right'] {
      width: 3px;
      top: 8px;
      bottom: 8px;
    }

    [data-resize-handle='left'] {
      left: -3px;
      cursor: ew-resize;
    }

    [data-resize-handle='right'] {
      right: -3px;
      cursor: ew-resize;
    }

    [data-resize-state='true'] [data-resize-wrapper] {
      outline: 1px solid rgba(0, 0, 0, 0.25);
      border-radius: 0.125rem;
    }
  }
`;
