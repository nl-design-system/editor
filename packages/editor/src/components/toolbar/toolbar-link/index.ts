import type { Editor } from '@tiptap/core';
import { localized, msg } from '@lit/localize';
import buttonCss from '@nl-design-system-candidate/button-css/button.css?inline';
import { ClippyModal } from '@nl-design-system-community/clippy-components/clippy-modal';
import LinkIcon from '@tabler/icons/outline/link.svg?raw';
import formFieldStyles from '@utrecht/form-field-css/dist/index.css?inline';
import formLabelStyles from '@utrecht/form-label-css/dist/index.css?inline';
import textBoxStyles from '@utrecht/textbox-css/dist/index.css?inline';
import '@nl-design-system-community/clippy-components/clippy-button';
import '@nl-design-system-community/clippy-components/clippy-icon';
import '@nl-design-system-community/clippy-components/clippy-combobox';
import { html, LitElement, nothing, unsafeCSS } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { createRef, ref, type Ref } from 'lit/directives/ref.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import { editor } from '@/decorators/TipTapDecorator.ts';
import { linkDialogStyles } from './styles.ts';

const ariaDescribedby = 'clippy-toolbar-link-dialog';

const tag = 'clippy-toolbar-link';

export interface SelectOption {
  label: string;
  value: string;
}

declare global {
  interface HTMLElementTagNameMap {
    [tag]: ToolbarLink;
  }
}

@localized()
@customElement(tag)
export class ToolbarLink extends LitElement {
  static override readonly styles = [
    linkDialogStyles,
    unsafeCSS(buttonCss),
    unsafeCSS(formFieldStyles),
    unsafeCSS(formLabelStyles),
    unsafeCSS(textBoxStyles),
  ];

  @query('clippy-modal')
  private readonly modalDialog!: ClippyModal;

  readonly #urlRef: Ref<HTMLInputElement> = createRef();
  readonly #textRef: Ref<HTMLInputElement> = createRef();
  readonly #titleRef: Ref<HTMLInputElement> = createRef();
  readonly #relRef: Ref<HTMLInputElement> = createRef();

  @state()
  private url = '';
  @state()
  private text = '';
  @state()
  private linkTitle = '';
  @state()
  private target = '';

  @state()
  private get targetOptions(): SelectOption[] {
    return [
      { label: msg('None'), value: '' },
      { label: msg('Current window'), value: '_self' },
      { label: msg('New window'), value: '_blank' },
    ];
  }

  @editor()
  private readonly editor: Editor | undefined;

  override disconnectedCallback(): void {
    super.disconnectedCallback();
  }

  readonly #handleTargetChange = (event: Event) => {
    const { value } = event.target as HTMLSelectElement;
    this.target = value || '';
  };

  get #targetSelectedIndex(): number {
    return this.targetOptions.findIndex(({ value }) => value === this.target);
  }

  readonly #unsetLink = () => {
    this.editor?.chain().focus().extendMarkRange('link').unsetLink().run();
    this.modalDialog.close();
  };

  readonly #updateLink = () => {
    const url = this.#urlRef.value?.value || '';
    const text = this.#textRef.value?.value || '';
    const title = this.#titleRef.value?.value || '';
    const target = this.target;
    const rel = this.#relRef.value?.value || '';

    if (!url) {
      this.modalDialog.close();
      return;
    }

    try {
      const linkAttrs: { href: string; title?: string; target?: string; rel?: string } = { href: url };

      if (title) linkAttrs['title'] = title;
      if (target) {
        linkAttrs['target'] = target;
        // Add noopener noreferrer for security when opening in new tab
        const relParts = rel ? rel.split(' ') : [];
        if (!relParts.includes('noopener')) relParts.push('noopener');
        if (!relParts.includes('noreferrer')) relParts.push('noreferrer');
        linkAttrs['rel'] = relParts.join(' ');
      } else if (rel) {
        linkAttrs['rel'] = rel;
      }

      // Update or insert link
      const chain = this.editor?.chain().focus();

      // If link exists, extend the mark range
      if (this.editor?.isActive('link')) {
        chain?.extendMarkRange('link');
      }

      // Set the link with all attributes
      chain?.setLink(linkAttrs);

      // Update the text if it changed
      const { state } = this.editor || {};
      const { from, to } = state?.selection || {};
      const currentText = state?.doc.textBetween(from || 0, to || 0, ' ') || '';

      if (text && text !== currentText) {
        chain?.insertContent(text);
      }

      chain?.run();
    } catch (error) {
      console.error(error);
    }

    this.modalDialog.close();
  };

  readonly #openLinkDialog = () => {
    if (!this.editor) return;

    const attrs = this.editor.getAttributes('link');
    this.url = attrs?.['href'] || '';
    this.linkTitle = attrs?.['title'] || '';
    this.target = attrs?.['target'] || '';

    // Get selected text or link content
    this.editor.chain().focus().extendMarkRange('link');

    const { from } = this.editor.state.selection;
    const linkNode = this.editor.state.doc.nodeAt(from);
    this.text = linkNode?.textContent || '';

    this.modalDialog.open();
  };

  override render() {
    return html`
      <clippy-button
        @click=${this.#openLinkDialog}
        aria-controls="clippy-link-dialog"
        .pressed=${this.editor?.isActive('link') ?? false}
        icon-only
        toggle
        size="small"
        purpose="secondary"
      >
        <clippy-icon slot="iconStart">${unsafeSVG(LinkIcon)}</clippy-icon>
        ${msg('Link')}
      </clippy-button>
      <clippy-modal
        .title=${msg('Insert/Edit Link')}
        actions="none"
        aria-describedby=${ariaDescribedby}
        data-testid="clippy-link-dialog"
      >
        <div class="utrecht-document">
          <form
            @submit=${(e: Event) => {
              e.preventDefault();
              this.#updateLink();
            }}
          >
            <div class="utrecht-form-field utrecht-form-field--text">
              <div class="utrecht-form-field__input">
                <input
                  readonly
                  aria-label=${msg('Link text example')}
                  ${ref(this.#textRef)}
                  type="text"
                  .value=${this.text}
                  class="utrecht-textbox utrecht-textbox--html-input"
                />
              </div>
            </div>

            <div class="utrecht-form-field utrecht-form-field--text">
              <div class="utrecht-form-field__label">
                <label class="utrecht-form-label">${msg('URL')}</label>
              </div>
              <div class="utrecht-form-field__input">
                <input
                  ${ref(this.#urlRef)}
                  type="url"
                  .value=${this.url}
                  class="utrecht-textbox utrecht-textbox--html-input"
                  @input=${(e: Event) => {
                    this.url = (e.target as HTMLInputElement).value;
                  }}
                  placeholder="https://example.com"
                  required
                  aria-required="true"
                />
              </div>
            </div>

            <div class="utrecht-form-field utrecht-form-field--text">
              <div class="utrecht-form-field__label">
                <label class="utrecht-form-label">${msg('Title')}</label>
              </div>
              <div class="utrecht-form-field__input">
                <input
                  ${ref(this.#titleRef)}
                  type="text"
                  .value=${this.linkTitle}
                  class="utrecht-textbox utrecht-textbox--html-input"
                  @input=${(e: Event) => {
                    this.linkTitle = (e.target as HTMLInputElement).value;
                  }}
                  placeholder=${msg('Tooltip text')}
                  aria-describedby="link-title-help"
                />
              </div>
            </div>

            <div class="utrecht-form-field utrecht-form-field--text">
              <div class="utrecht-form-field__label">
                <label class="utrecht-form-label">${msg('Target')}</label>
              </div>
              <div class="utrecht-form-field__input">
                <clippy-combobox
                  @change=${this.#handleTargetChange}
                  hidden-label=${msg('Select link target')}
                  value=${this.target}
                  .selectedIndex=${this.#targetSelectedIndex}
                  .options=${this.targetOptions}
                ></clippy-combobox>
              </div>
            </div>
            <div class="toolbar-link__actions">
              ${
                this.editor?.isActive('link')
                  ? html`
                      <clippy-button type="button" purpose="secondary" hint="negative" @click=${this.#unsetLink} style="margin-inline-end: auto"">
                        ${msg('Remove link')}
                      </clippy-button>
                    `
                  : nothing
              }
              <clippy-button type="button" @click=${() => this.modalDialog.close()}>${msg('Close')}</clippy-button>
              <button type="submit" class="nl-button nl-button--primary">
                ${this.editor?.isActive('link') ? msg('Update') : msg('Add link')}
              </button>
          </form>
        </div>
      </clippy-modal>
    `;
  }
}
