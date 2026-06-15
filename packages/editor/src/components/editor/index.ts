import { safeCustomElement } from '@nl-design-system-community/clippy-components/lib/decorators';
import { html } from 'lit';
import '../toolbar';
import '../validations/gutter';
import '../validations/drawer';
import '../validations/list';
import '../bubble-menu';
import '../content-views/heading-structure';
import '../content-views/link-list';
import '../content-views/language-changes';
import { property } from 'lit/decorators.js';
import '../content';
import { Context } from '../context';
import { type ToolbarConfig, defaultToolbarConfig } from '../toolbar/toolbar-config.ts';

const EDITOR_ID = 'editor';

const tag = 'clippy-editor';

declare global {
  interface HTMLElementTagNameMap {
    [tag]: Editor;
  }
}

@safeCustomElement(tag)
export class Editor extends Context {
  @property({ attribute: 'toolbar-config', type: Array })
  toolbarConfig: ToolbarConfig = defaultToolbarConfig;

  override render() {
    return html`
      <clippy-toolbar .config=${this.toolbarConfig}></clippy-toolbar>
      <div class="clippy-editor-container" id=${EDITOR_ID}>
        <slot name="value" hidden></slot>
        <clippy-validations-gutter
          .validationsMap=${this.validationsContext}
        ></clippy-validations-gutter>
        <clippy-content></clippy-content>
        <clippy-bubble-menu class="clippy-bubble-menu"></clippy-bubble-menu>
      </div>
      <clippy-validations-dialog></clippy-validations-dialog>
    `;
  }
}
