import { safeCustomElement } from '@nl-design-system-community/clippy-components/lib/decorators';
import { html } from 'lit';
import '@/components/editor-wrapper';
import '@/components/editor-content-wrapper';
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
import type { DrawerPosition } from '@/components/editor-wrapper';
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

  /**
   * Side of the editor content on which the validations drawer is rendered.
   * Defaults to `right`.
   */
  @property({ attribute: 'drawer-position' })
  drawerPosition: DrawerPosition = 'right';

  override render() {
    return html`
      <clippy-editor-wrapper drawer-position=${this.drawerPosition}>
        <clippy-editor-content-wrapper>
          <clippy-toolbar .config=${this.toolbarConfig}></clippy-toolbar>
          <div class="clippy-editor-container" id=${EDITOR_ID}>
            <slot name="value" hidden></slot>
            <clippy-validations-gutter></clippy-validations-gutter>
            <clippy-content></clippy-content>
            <clippy-bubble-menu class="clippy-bubble-menu"></clippy-bubble-menu>
          </div>
        </clippy-editor-content-wrapper>
        <clippy-validations-drawer></clippy-validations-drawer>
      </clippy-editor-wrapper>
    `;
  }
}
