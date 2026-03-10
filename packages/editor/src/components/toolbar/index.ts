import type { Editor } from '@tiptap/core';
import type { TemplateResult } from 'lit';
import { consume } from '@lit/context';
import { localized, msg, str } from '@lit/localize';
import numberBadgeStyles from '@nl-design-system-candidate/number-badge-css/number-badge.css?inline';
import AccessibleIcon from '@tabler/icons/outline/accessible.svg?raw';
import ArrowBackUpIcon from '@tabler/icons/outline/arrow-back-up.svg?raw';
import ArrowForwardUpIcon from '@tabler/icons/outline/arrow-forward-up.svg?raw';
import BoldIcon from '@tabler/icons/outline/bold.svg?raw';
import './shortcuts-dialog';
import CodeIcon from '@tabler/icons/outline/code.svg?raw';
import IconHighlight from '@tabler/icons/outline/highlight.svg?raw';
import ItalicIcon from '@tabler/icons/outline/italic.svg?raw';
import KeyboardIcon from '@tabler/icons/outline/keyboard.svg?raw';
import ListDetailsIcon from '@tabler/icons/outline/list-details.svg?raw';
import OrderedListIcon from '@tabler/icons/outline/list-numbers.svg?raw';
import BulletListIcon from '@tabler/icons/outline/list.svg?raw';
import SeparatorIcon from '@tabler/icons/outline/separator.svg?raw';
import StrikethroughIcon from '@tabler/icons/outline/strikethrough.svg?raw';
import SubscriptIcon from '@tabler/icons/outline/subscript.svg?raw';
import SuperscriptIcon from '@tabler/icons/outline/superscript.svg?raw';
import TableIcon from '@tabler/icons/outline/table.svg?raw';
import '@nl-design-system-community/clippy-components/clippy-button';
import '@nl-design-system-community/clippy-components/clippy-icon';
import IconTextDirectionLtr from '@tabler/icons/outline/text-direction-ltr.svg?raw';
import IconTextDirectionRtl from '@tabler/icons/outline/text-direction-rtl.svg?raw';
import './toolbar-format-select';
import './toolbar-language-select';
import './toolbar-text-align';
import UnderlineIcon from '@tabler/icons/outline/underline.svg?raw';
import { LitElement, html, unsafeCSS, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { createRef, type Ref } from 'lit/directives/ref.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import type { ValidationsMap } from '@/types/validation.ts';
import { identifierContext } from '@/context/identifierContext.ts';
import { validationsContext } from '@/context/validationsContext.ts';
import { editor } from '@/decorators/TipTapDecorator.ts';
import { CustomEvents } from '@/events';
import './toolbar-image-upload';
import './toolbar-link';
import toolbarStyles from './styles.ts';
import { type ToolbarConfig, type ToolbarItem, defaultToolbarConfig } from './toolbar-config.ts';
import { isDefaultDir } from './toolbar-language-select/languages.ts';

const tag = 'clippy-toolbar';

declare global {
  interface HTMLElementTagNameMap {
    [tag]: Toolbar;
  }
}

@localized()
@customElement('clippy-toolbar')
export class Toolbar extends LitElement {
  readonly #dialogRef: Ref<HTMLDialogElement> = createRef();
  readonly #focusNode: Ref<HTMLButtonElement> = createRef();

  @property({ type: Array })
  config: ToolbarConfig = defaultToolbarConfig;

  @consume({ context: identifierContext, subscribe: true })
  @property({ attribute: false })
  private readonly identifier?: string;

  @consume({ context: validationsContext, subscribe: true })
  @property({ attribute: false })
  validationsContext?: ValidationsMap;

  @editor()
  private readonly editor: Editor | undefined;

  readonly #toggleOpenShortcuts = () => {
    const { value } = this.#dialogRef;
    if (this.#dialogRef.value?.open) {
      value?.close();
    } else {
      value?.showModal();
    }
  };

  readonly #onToolbarFocus = () => {
    const { value } = this.#focusNode;
    value?.shadowRoot?.querySelector('button')?.focus();
  };

  readonly #toggleOpenValidationsDialog = () => {
    console.log(this.identifier);
    globalThis.dispatchEvent(
      new CustomEvent(CustomEvents.OPEN_VALIDATIONS_DIALOG, {
        bubbles: true,
        composed: true,
        detail: { identifier: this.identifier },
      }),
    );
  };

  readonly #toggleTextDirection = (dir: string) => {
    const nodeTypeName = this.editor?.state.selection.$anchor.node().type.name;

    if (!nodeTypeName) {
      return;
    }

    const isActive = this.editor?.isActive(nodeTypeName, { dir });
    const newValue = isActive ? null : dir;

    this.editor?.chain().focus().updateAttributes(nodeTypeName, { dir: newValue }).run();
  };

  override connectedCallback() {
    globalThis.addEventListener(CustomEvents.FOCUS_TOOLBAR, this.#onToolbarFocus);
    super.connectedCallback();
  }

  override disconnectedCallback() {
    globalThis.removeEventListener(CustomEvents.FOCUS_TOOLBAR, this.#onToolbarFocus);
    super.disconnectedCallback();
  }

  #getCurrentLanguage(): string | null {
    return this.editor?.state.selection.$anchor.node().attrs['lang'];
  }

  #getCurrentTextDirection(): string | null {
    return this.editor?.state.selection.$anchor.node().attrs['dir'];
  }

  readonly #isOddTextDirection = () => {
    const lang = this.#getCurrentLanguage();
    const dir = this.#getCurrentTextDirection();
    if (!lang && !dir) {
      return false;
    }
    return !isDefaultDir(lang ?? '', dir ?? '');
  };

  get #itemRenderers(): Map<ToolbarItem, () => TemplateResult | typeof nothing> {
    const { size = 0 } = this.validationsContext || {};

    return new Map<ToolbarItem, () => TemplateResult | typeof nothing>([
      ['format-select', () => html`<clippy-format-select data-toolbar-item="format-select"></clippy-format-select>`],
      [
        'language-select',
        () =>
          html`<clippy-language-select
            data-toolbar-item="language-select"
            matchTextDirection
          ></clippy-language-select>`,
      ],
      [
        'bold',
        () => html`
          <clippy-button
            data-toolbar-item="bold"
            toggle
            .pressed=${this.editor?.isActive('bold') ?? false}
            @click=${() => this.editor?.chain().focus().toggleBold().run()}
            icon-only
            size="small"
            purpose="secondary"
          >
            <clippy-icon slot="iconStart">${unsafeSVG(BoldIcon)}</clippy-icon>
            ${msg('Bold')}
          </clippy-button>
        `,
      ],
      [
        'italic',
        () => html`
          <clippy-button
            data-toolbar-item="italic"
            toggle
            .pressed=${this.editor?.isActive('italic') ?? false}
            @click=${() => this.editor?.chain().focus().toggleItalic().run()}
            icon-only
            size="small"
            purpose="secondary"
          >
            <clippy-icon slot="iconStart">${unsafeSVG(ItalicIcon)}</clippy-icon>
            ${msg('Italic')}
          </clippy-button>
        `,
      ],
      [
        'underline',
        () => html`
          <clippy-button
            data-toolbar-item="underline"
            toggle
            .pressed=${this.editor?.isActive('underline') ?? false}
            @click=${() => this.editor?.chain().focus().toggleUnderline().run()}
            icon-only
            size="small"
            purpose="secondary"
          >
            <clippy-icon slot="iconStart">${unsafeSVG(UnderlineIcon)}</clippy-icon>
            ${msg('Underline')}
          </clippy-button>
        `,
      ],
      [
        'strike',
        () => html`
          <clippy-button
            data-toolbar-item="strike"
            toggle
            .pressed=${this.editor?.isActive('strike') ?? false}
            @click=${() => this.editor?.chain().focus().toggleStrike().run()}
            icon-only
            size="small"
            purpose="secondary"
          >
            <clippy-icon slot="iconStart">${unsafeSVG(StrikethroughIcon)}</clippy-icon>
            ${msg('Strike')}
          </clippy-button>
        `,
      ],
      [
        'code',
        () => html`
          <clippy-button
            data-toolbar-item="code"
            toggle
            .pressed=${this.editor?.isActive('code') ?? false}
            @click=${() => this.editor?.chain().focus().toggleCode().run()}
            icon-only
            size="small"
            purpose="secondary"
          >
            <clippy-icon slot="iconStart">${unsafeSVG(CodeIcon)}</clippy-icon>
            ${msg('Code')}
          </clippy-button>
        `,
      ],
      [
        'highlight',
        () => html`
          <clippy-button
            data-toolbar-item="highlight"
            .pressed=${this.editor?.isActive('highlight') ?? false}
            @click=${() => this.editor?.chain().focus().toggleHighlight().run()}
            icon-only
            size="small"
            purpose="secondary"
          >
            <clippy-icon slot="iconStart">${unsafeSVG(IconHighlight)}</clippy-icon>
            ${msg('Highlight')}
          </clippy-button>
        `,
      ],
      [
        'superscript',
        () => html`
          <clippy-button
            data-toolbar-item="superscript"
            .pressed=${this.editor?.isActive('superscript') ?? false}
            toggle
            @click=${() => this.editor?.chain().focus().toggleSuperscript().run()}
            icon-only
            size="small"
            purpose="secondary"
          >
            <clippy-icon slot="iconStart">${unsafeSVG(SuperscriptIcon)}</clippy-icon>
            ${msg('Superscript')}
          </clippy-button>
        `,
      ],
      [
        'subscript',
        () => html`
          <clippy-button
            data-toolbar-item="subscript"
            .pressed=${this.editor?.isActive('subscript') ?? false}
            toggle
            @click=${() => this.editor?.chain().focus().toggleSubscript().run()}
            icon-only
            size="small"
            purpose="secondary"
          >
            <clippy-icon slot="iconStart">${unsafeSVG(SubscriptIcon)}</clippy-icon>
            ${msg('Subscript')}
          </clippy-button>
        `,
      ],
      [
        'undo',
        () => html`
          <clippy-button
            data-toolbar-item="undo"
            ?disabled=${!(this.editor?.can().undo() ?? false)}
            @click=${() => this.editor?.commands.undo()}
            icon-only
            size="small"
            purpose="secondary"
          >
            <clippy-icon slot="iconStart">${unsafeSVG(ArrowBackUpIcon)}</clippy-icon>
            ${msg('Undo')}
          </clippy-button>
        `,
      ],
      [
        'redo',
        () => html`
          <clippy-button
            data-toolbar-item="redo"
            ?disabled=${!(this.editor?.can().redo() ?? false)}
            @click=${() => this.editor?.commands.redo()}
            icon-only
            size="small"
            purpose="secondary"
          >
            <clippy-icon slot="iconStart">${unsafeSVG(ArrowForwardUpIcon)}</clippy-icon>
            ${msg('Redo')}
          </clippy-button>
        `,
      ],
      [
        'ordered-list',
        () => html`
          <clippy-button
            data-toolbar-item="ordered-list"
            .pressed=${this.editor?.isActive('orderedList') ?? false}
            @click=${() => {
              this.editor?.chain().focus().toggleOrderedList().run();
            }}
            icon-only
            size="small"
            purpose="secondary"
          >
            <clippy-icon slot="iconStart">${unsafeSVG(OrderedListIcon)}</clippy-icon>
            ${msg('Numbered list')}
          </clippy-button>
        `,
      ],
      [
        'bullet-list',
        () => html`
          <clippy-button
            data-toolbar-item="bullet-list"
            toggle
            .pressed=${this.editor?.isActive('bulletList') ?? false}
            @click=${() => this.editor?.chain().focus().toggleBulletList().run()}
            icon-only
            size="small"
            purpose="secondary"
          >
            <clippy-icon slot="iconStart">${unsafeSVG(BulletListIcon)}</clippy-icon>
            ${msg('Unordered list')}
          </clippy-button>
        `,
      ],
      [
        'definition-list',
        () => html`
          <clippy-button
            data-toolbar-item="definition-list"
            toggle
            .pressed=${this.editor?.isActive('definitionList') ?? false}
            @click=${() => this.editor?.chain().focus().insertDefinitionList().run()}
            icon-only
            size="small"
            purpose="secondary"
          >
            <clippy-icon slot="iconStart">${unsafeSVG(ListDetailsIcon)}</clippy-icon>
            ${msg('Definition list')}
          </clippy-button>
        `,
      ],
      [
        'insert-table',
        () => html`
          <clippy-button
            data-toolbar-item="insert-table"
            @click=${() => this.editor?.chain().focus().insertTable({ cols: 3, rows: 2, withHeaderRow: true }).run()}
            icon-only
            size="small"
            purpose="secondary"
          >
            <clippy-icon slot="iconStart">${unsafeSVG(TableIcon)}</clippy-icon>
            ${msg('Insert table')}
          </clippy-button>
        `,
      ],
      [
        'text-align',
        () => html`<clippy-toolbar-text-align data-toolbar-item="text-align"></clippy-toolbar-text-align>`,
      ],
      ['link', () => html`<clippy-toolbar-link data-toolbar-item="link"></clippy-toolbar-link>`],
      [
        'image-upload',
        () => html`<clippy-toolbar-image-upload data-toolbar-item="image-upload"></clippy-toolbar-image-upload>`,
      ],
      [
        'horizontal-rule',
        () => html`
          <clippy-button
            data-toolbar-item="horizontal-rule"
            @click=${() => this.editor?.chain().focus().setHorizontalRule().run()}
            icon-only
            size="small"
            purpose="secondary"
          >
            <clippy-icon slot="iconStart">${unsafeSVG(SeparatorIcon)}</clippy-icon>
            ${msg('Horizontal rule')}
          </clippy-button>
        `,
      ],
      [
        'text-direction-ltr',
        () => html`
          <clippy-button
            data-toolbar-item="text-direction-ltr"
            toggle
            .pressed=${this.editor?.isActive(this.editor?.state.selection.$anchor.node().type.name, { dir: 'ltr' }) ??
            false}
            @click=${() => this.#toggleTextDirection('rtl')}
            icon-only
            size="small"
            purpose="secondary"
            ?hidden=${!this.#isOddTextDirection()}
          >
            <clippy-icon slot="iconStart">${unsafeSVG(IconTextDirectionLtr)}</clippy-icon>
            ${msg('Left to right')}
          </clippy-button>
        `,
      ],
      [
        'text-direction-rtl',
        () => html`
          <clippy-button
            data-toolbar-item="text-direction-rtl"
            toggle
            .pressed=${this.editor?.isActive(this.editor?.state.selection.$anchor.node().type.name, { dir: 'rtl' }) ??
            false}
            @click=${() => this.#toggleTextDirection('rtl')}
            icon-only
            size="small"
            purpose="secondary"
            ?hidden=${!this.#isOddTextDirection()}
          >
            <clippy-icon slot="iconStart">${unsafeSVG(IconTextDirectionRtl)}</clippy-icon>
            ${msg('Right to left')}
          </clippy-button>
        `,
      ],
      [
        'keyboard-shortcuts',
        () => html`
          <clippy-button
            data-toolbar-item="keyboard-shortcuts"
            .pressed=${this.#dialogRef.value?.open ?? false}
            @click=${this.#toggleOpenShortcuts}
            icon-only
            size="small"
            purpose="secondary"
          >
            <clippy-icon slot="iconStart">${unsafeSVG(KeyboardIcon)}</clippy-icon>
            ${msg('Keyboard shortcuts')}
          </clippy-button>
        `,
      ],
      [
        'accessibility-notifications',
        () => html`
          <span data-toolbar-item="accessibility-notifications" style="position: relative;">
            <clippy-button
              @click=${this.#toggleOpenValidationsDialog}
              aria-controls="dialog-content"
              icon-only
              size="small"
              purpose="secondary"
            >
              <clippy-icon slot="iconStart">${unsafeSVG(AccessibleIcon)}</clippy-icon>
              ${msg('Show accessibility notifications')}
            </clippy-button>
            ${size > 0
              ? html`<data value=${size} class="nl-number-badge nl-number-badge--clippy">
                  <span hidden aria-hidden="true" class="nl-number-badge__visible-label">${size}</span>
                  <span class="nl-number-badge__hidden-label">${msg(str`${size} accessibility notifications`)}</span>
                </data>`
              : nothing}
          </span>
        `,
      ],
    ]);
  }

  static override readonly styles = [toolbarStyles, unsafeCSS(numberBadgeStyles)];

  override render() {
    const { size = 0 } = this.validationsContext || {};
    const renderers = this.#itemRenderers;
    const visibleGroups = this.config.filter((group) => group.some((id) => renderers.has(id)));
    return html`
      <div class="clippy-toolbar__wrapper" role="toolbar" aria-label=${msg('Text editor toolbar')}>
        ${visibleGroups.map(
          (group, index) => html`
            ${index > 0 ? html`<div class="clippy-toolbar__divider"></div>` : nothing}
            <div role="group">
              ${group.map((itemId) => {
                const renderer = renderers.get(itemId);
                return renderer ? renderer() : nothing;
              })}
            </div>
          `,
        )}
      </div>
      <clippy-shortcuts .dialogRef=${this.#dialogRef}></clippy-shortcuts>
      <div class="clippy-screen-reader-text" aria-live=${size > 0 ? 'polite' : 'off'}>
        ${msg(str`Total ${size} accessibility notifications found.`)}
      </div>
    `;
  }
}
