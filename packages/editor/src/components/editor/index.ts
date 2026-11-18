import type { Validation } from '@nl-design-system-community/clippy-a11y-validator';
import type { Editor as TiptapEditor } from '@tiptap/core';
import { safeCustomElement } from '@nl-design-system-community/clippy-components/lib/decorators';
import { html, LitElement, type PropertyValues } from 'lit';
import { property, query, queryAssignedElements, state } from 'lit/decorators.js';
import '@/components/editor-content-wrapper';
import '@/components/toolbar';
import '@/components/validations/gutter';
import '@/components/validations/list';
import '@/components/bubble-menu';
import '@/components/content-views/heading-structure';
import '@/components/content-views/link-list';
import '@/components/content-views/language-changes';
import '@/components/content';
import type { Content } from '@/components/content';
import type { Toolbar } from '@/components/toolbar';
import type { Gutter } from '@/components/validations/gutter';
import { type ToolbarConfig, defaultToolbarConfig } from '@/components/toolbar/toolbar-config';
import { ClippyHubController } from '@/controllers/ClippyHubController';
import { TiptapEditorController } from '@/controllers/TiptapEditorController';
import { ViolationsDevtoolsController } from '@/controllers/ViolationsDevtoolsController';
import { initializeLocale } from '@/localization';
import { editorStyles } from './styles';

const EDITOR_ID = 'editor';

const tag = 'clippy-editor';

declare global {
  interface HTMLElementTagNameMap {
    [tag]: Editor;
  }
}

/**
 * The main rich text editor component. It composes the toolbar, editable content area,
 * accessibility validation gutter and bubble menu, and validates its content through a
 * Clippy hub, which docks the Drawer at the end side of the screen.
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
export class Editor extends LitElement {
  static override readonly styles = editorStyles;

  /**
   * Unique identifier for this editor instance. Reflected as the host element's
   * `id` attribute and used to scope validation events across multiple editors
   * on the same page.
   */
  @property({ reflect: true, type: String })
  override id = 'clippy-editor-id';

  /**
   * The validations to run. Defaults to every core validation of
   * `@nl-design-system-community/clippy-a11y-validator`.
   */
  @property({ attribute: false })
  validations?: readonly Validation[];

  /**
   * When `true`, the editor is rendered in read-only mode. TipTap is not
   * initialised; accessibility validations are still run against the slot content.
   * @default false
   */
  @property({ attribute: 'readonly', reflect: true, type: Boolean })
  readonly = false;

  /**
   * Configures which toolbar items (and their grouping) are visible.
   * Defaults to {@link defaultToolbarConfig}.
   */
  @property({ attribute: 'toolbar-config', type: Array })
  toolbarConfig: ToolbarConfig = defaultToolbarConfig;

  /** @internal */
  @state()
  private readonlyValue?: HTMLElement;

  /** @internal */
  @queryAssignedElements({ flatten: true, slot: 'value' })
  private readonly valueSlot!: HTMLElement[];

  /** @internal */
  @query('clippy-content')
  private readonly content!: Content | null;

  /** @internal */
  @query('clippy-toolbar')
  private readonly toolbar!: Toolbar | null;

  /** @internal */
  @query('clippy-validations-gutter')
  private readonly gutter!: Gutter | null;

  /**
   * @internal Mirrors every validation run into the Redux DevTools extension, when it is
   * installed. Inert otherwise.
   */
  violationsDevtools = new ViolationsDevtoolsController(this, () => this.id);

  readonly #hub = new ClippyHubController(this, {
    adaptViolations: (violationsMap) => {
      this.violationsDevtools.send(violationsMap);
      return violationsMap;
    },
    colorSchemeElement: () => this,
    identifier: () => this.id,
    validations: () => this.validations,
    views: () => ({ gutter: this.gutter, trigger: this.toolbar?.trigger }),
  });

  readonly #tiptap = new TiptapEditorController(this, {
    editable: () => !this.readonly,
    hub: this.#hub,
    identifier: () => this.id,
  });

  #isLocaleInitialized = false;

  /** @internal */
  get editor(): TiptapEditor | undefined {
    return this.#tiptap.editor;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    if (!this.#isLocaleInitialized) {
      this.#isLocaleInitialized = true;
      initializeLocale()
        .then(() => {
          this.requestUpdate();
        })
        .catch(console.error);
    }
    if (this.hasUpdated && this.readonlyValue) {
      this.#validateReadonly();
    }
  }

  override firstUpdated(): void {
    const value = this.valueSlot.find((el) => el instanceof HTMLDivElement);

    if (this.readonly) {
      this.readonlyValue = value;
      this.#validateReadonly();
      return;
    }

    this.#tiptap.create(value?.innerHTML ?? '');
  }

  override updated(changedProperties: PropertyValues<this>): void {
    super.updated(changedProperties);
    if (changedProperties.has('readonly')) {
      this.#tiptap.setEditable(!this.readonly);
    }
    if (changedProperties.has('validations')) {
      this.#hub.updateValidations();
    }
  }

  #validateReadonly(): void {
    this.updateComplete
      .then(() => this.content?.updateComplete)
      .then(async () => {
        if (this.isConnected && this.content) {
          await this.#hub.connect(this.content)?.validate();
        }
      })
      .catch(console.error);
  }

  override render() {
    return html`
      <clippy-editor-content-wrapper>
        <clippy-toolbar .config=${this.toolbarConfig} .editor=${this.editor}></clippy-toolbar>
        <div class="clippy-editor-container" id=${EDITOR_ID}>
          <slot name="value" hidden></slot>
          <clippy-validations-gutter mode="drawer"></clippy-validations-gutter>
          <clippy-content .editor=${this.editor} .htmlDocument=${this.readonlyValue}></clippy-content>
          <clippy-bubble-menu class="clippy-bubble-menu" .editor=${this.editor}></clippy-bubble-menu>
        </div>
      </clippy-editor-content-wrapper>
    `;
  }
}
