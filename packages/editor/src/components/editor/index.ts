import { html } from 'lit';
import { property } from 'lit/decorators.js';
import '../toolbar';
import '../validations/gutter';
import '../validations/drawer';
import '../validations/list';
import '../bubble-menu';
import '../content-views/heading-structure';
import '../content-views/link-list';
import '../content-views/language-changes';
import { safeCustomElement } from '@/decorators/SafeCustomElementDecorator.ts';
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

/**
 * The main rich text editor component. It composes the toolbar, editable content area,
 * accessibility validation gutter, bubble menu and the validations dialog.
 *
 * @element clippy-editor
 *
 * @slot value - Hidden slot for providing an initial HTML value to the editor.
 *
 * @example
 * ```html
 * <clippy-editor>
 *   <div slot="value"><p>Hello world</p></div>
 * </clippy-editor>
 * ```
 *
 * @wcag WCAG 2.2 Level AA – keyboard navigable editor; ATAG 2.0 Part A & B
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
      <clippy-validations-dialog></clippy-validations-dialog>
    `;
  }
}
