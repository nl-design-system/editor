import { css } from 'lit';

export default css`
  :host {
    background-color: #fff;
    display: block;
    padding-block: var(--basis-space-inline-xl);
    padding-inline: var(--basis-space-inline-xl);
    position: relative;

    --clippy-background-texture-info: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+Cjxzdmcgd2lkdGg9IjIwcHgiIGhlaWdodD0iMjBweCIgdmlld0JveD0iMCAwIDIwIDIwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDxkZWZzPgogICAgPG1hc2sgaWQ9ImN1dG91dCIgbWFza1VuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CiAgICAgIDxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iI2ZmZiIvPgogICAgICA8Y2lyY2xlIGN4PSIzIiBjeT0iMyIgcj0iMyIgZmlsbD0iIzAwMCIvPgogICAgICA8Y2lyY2xlIGN4PSIxMyIgY3k9IjEzIiByPSIzIiBmaWxsPSIjMDAwIi8+CiAgICA8L21hc2s+CiAgPC9kZWZzPgogIDxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iI2ZmZiIgbWFzaz0idXJsKCNjdXRvdXQpIi8+Cjwvc3ZnPgo=');
    --clippy-background-texture-warning: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+Cjxzdmcgd2lkdGg9IjZweCIgaGVpZ2h0PSI2cHgiIHZpZXdCb3g9IjAgMCA2IDYiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPgogIDxkZWZzPgogICAgPG1hc2sgaWQ9ImN1dG91dCIgbWFza1VuaXRzPSJ1c2VyU3BhY2VPblVzZSIgbWFza0NvbnRlbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgogICAgICA8cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSI2IiBmaWxsPSIjRkZGRkZGIi8+CiAgICAgIDxwb2x5Z29uIHBvaW50cz0iMSAwIDAgMCA2IDYgNiA1IiBmaWxsPSIjMDAwMDAwIi8+CiAgICAgIDxwb2x5Z29uIHBvaW50cz0iMCA1IDAgNiAxIDYiIGZpbGw9IiMwMDAwMDAiLz4KICAgIDwvbWFzaz4KICA8L2RlZnM+CiAgPHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjYiIGhlaWdodD0iNiIgZmlsbD0iI0ZGRkZGRiIgbWFzaz0idXJsKCNjdXRvdXQpIi8+Cjwvc3ZnPg==');
    --clippy-background-texture-error: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+Cjxzdmcgd2lkdGg9IjZweCIgaGVpZ2h0PSI2cHgiIHZpZXdCb3g9IjAgMCA2IDYiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPgogIDxkZWZzPgogICAgPG1hc2sgaWQ9ImN1dG91dCIgbWFza1VuaXRzPSJ1c2VyU3BhY2VPblVzZSIgbWFza0NvbnRlbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgogICAgICA8cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSI2IiBmaWxsPSIjRkZGRkZGIi8+CiAgICAgIDxwb2x5Z29uIHBvaW50cz0iNSAwIDYgMCAwIDYgMCA1IiBmaWxsPSIjMDAwMDAwIi8+CiAgICAgIDxwb2x5Z29uIHBvaW50cz0iNiA1IDYgNiA1IDYiIGZpbGw9IiMwMDAwMDAiLz4KICAgIDwvbWFzaz4KICA8L2RlZnM+CiAgPCEtLSBDaGFuZ2UgZmlsbCB0byBkZXNpcmVkIHNvbGlkIGNvbG9yIC0tPgogIDxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSI2IiBoZWlnaHQ9IjYiIGZpbGw9IiNGRkZGRkYiIG1hc2s9InVybCgjY3V0b3V0KSIvPgo8L3N2Zz4K');
  }

  p.is-editor-empty:first-child::before {
    color: var(--ma-color-neutral-8);
    content: attr(data-placeholder);
    float: left;
    height: 0;
    pointer-events: none;
  }

  .clippy-editor-content {
    padding-block: var(--basis-space-inline-lg);
    padding-inline: var(--basis-space-inline-lg);
  }

  .clippy-editor-content:focus-visible {
    outline-style: dashed;
    outline-color: var(--ma-color-paars-8);
    outline-offset: -1px;
  }

  [data-resizer] {
    background-color: #f0f0f0;
  }

  [data-resize-handle] {
    position: absolute;
    background: rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.8);
    border-radius: 2px;
    z-index: 10;

    &:hover {
      background: rgba(0, 0, 0, 0.8);
    }

    /* Corner handles */
    &[data-resize-handle='top-left'],
    &[data-resize-handle='top-right'],
    &[data-resize-handle='bottom-left'],
    &[data-resize-handle='bottom-right'] {
      width: 8px;
      height: 8px;
    }

    &[data-resize-handle='top-left'] {
      top: -4px;
      left: -4px;
      cursor: nwse-resize;
    }

    &[data-resize-handle='top-right'] {
      top: -4px;
      right: -4px;
      cursor: nesw-resize;
    }

    &[data-resize-handle='bottom-left'] {
      bottom: -4px;
      left: -4px;
      cursor: nesw-resize;
    }

    &[data-resize-handle='bottom-right'] {
      bottom: -4px;
      right: -4px;
      cursor: nwse-resize;
    }

    /* Edge handles */
    &[data-resize-handle='top'],
    &[data-resize-handle='bottom'] {
      height: 6px;
      left: 8px;
      right: 8px;
    }

    &[data-resize-handle='top'] {
      top: -3px;
      cursor: ns-resize;
    }

    &[data-resize-handle='bottom'] {
      bottom: -3px;
      cursor: ns-resize;
    }

    &[data-resize-handle='left'],
    &[data-resize-handle='right'] {
      width: 6px;
      top: 8px;
      bottom: 8px;
    }

    &[data-resize-handle='left'] {
      left: -3px;
      cursor: ew-resize;
    }

    &[data-resize-handle='right'] {
      right: -3px;
      cursor: ew-resize;
    }
  }

  [data-resize-state='true'] [data-resize-wrapper] {
    outline: 1px solid rgba(0, 0, 0, 0.25);
    border-radius: 0.125rem;
  }

  img {
    height: auto;
    max-width: 100%;

    &.ProseMirror-selectednode {
      outline: 3px solid var(--purple);
    }
  }
`;
