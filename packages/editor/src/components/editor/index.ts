import { safeCustomElement } from '@nl-design-system-community/clippy-components/lib/decorators';
import { html } from 'lit';
import '@/components/toolbar';
import '@/components/validations/gutter';
import '@/components/validations/drawer';
import '@/components/validations/list';
import '@/components/bubble-menu';
import '@/components/content-views/heading-structure';
import '@/components/content-views/link-list';
import '@/components/content-views/language-changes';
import { property } from 'lit/decorators.js';
import '@/components/content';
import { Context } from '@/components/context';
import { type ToolbarConfig, defaultToolbarConfig } from '@/components/toolbar/toolbar-config';

const EDITOR_ID = 'editor';

const tag = 'clippy-editor';

declare global {
  interface HTMLElementTagNameMap {
    [tag]: Editor;
  }
}

/**
 * The main rich text editor component. It composes the toolbar, editable content area,
 * accessibility validation gutter, bubble menu and the validations dialog.
 *
 * @tag clippy-editor
 *
 * @slot value - Hidden slot for providing an initial HTML value to the editor.
 *
 * @example
 * ```html
 * <clippy-editor>
 *   <div slot="value"><p>Hello world</p></div>
 * </clippy-editor>
 * ```
 */
@safeCustomElement(tag)
export class Editor extends Context {
  /**
   * Configures which toolbar items (and their grouping) are visible.
   * Defaults to {@link defaultToolbarConfig}.
   */
  @property({ attribute: 'toolbar-config', type: Array })
  toolbarConfig: ToolbarConfig = defaultToolbarConfig;

  override render() {
    return html`
      <clippy-toolbar .config=${this.toolbarConfig}></clippy-toolbar>
      <div class="clippy-editor-container" id=${EDITOR_ID}>
        <slot name="value" hidden></slot>
        <clippy-validations-gutter></clippy-validations-gutter>
        <clippy-content></clippy-content>
        <clippy-bubble-menu class="clippy-bubble-menu"></clippy-bubble-menu>
      </div>
      <clippy-validations-drawer></clippy-validations-drawer>
    `;
  }
}
