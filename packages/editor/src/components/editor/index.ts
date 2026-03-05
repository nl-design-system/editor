import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import '../toolbar';
import '../validations/gutter';
import '../validations/drawer';
import '../validations/list';
import '../bubble-menu';
import { Context } from '../context';
import '../content';
import { type ToolbarConfig, defaultToolbarConfig } from '../toolbar/toolbar-config.ts';

const EDITOR_ID = 'editor';

const tag = 'clippy-editor';

declare global {
  interface HTMLElementTagNameMap {
    [tag]: Editor;
  }
}

@customElement(tag)
export class Editor extends Context {
  @property({ attribute: 'toolbar-config', type: Array })
  toolbarConfig: ToolbarConfig = defaultToolbarConfig;

  override render() {
    return html`
      <clippy-toolbar .config=${this.toolbarConfig}></clippy-toolbar>
      <div class="clippy-editor-container" id=${EDITOR_ID}>
        <slot name="content" hidden></slot>
        <clippy-validations-gutter></clippy-validations-gutter>
        <clippy-content></clippy-content>
        <clippy-bubble-menu class="clippy-bubble-menu"></clippy-bubble-menu>
      </div>
      <clippy-validations-dialog></clippy-validations-dialog>
    `;
  }
}
