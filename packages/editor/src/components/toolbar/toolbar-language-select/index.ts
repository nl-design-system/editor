import type { Editor } from '@tiptap/core';
import '@nl-design-system-community/clippy-components/clippy-lang-combobox';
import { localized, msg } from '@lit/localize';
import buttonCss from '@nl-design-system-candidate/button-css/button.css?inline';
import { css, html, LitElement, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import { safeCustomElement } from '@/decorators/SafeCustomElementDecorator.ts';
import { editor } from '@/decorators/TipTapDecorator.ts';
import { sourceLocale } from '@/generated/locale-codes.ts';
import { findNearestAncestorAttribute } from '@/utils/domTraverser.ts';
import { languages, isSameLanguage, type Language } from './languages.ts';

export interface SelectOption {
  active: boolean;
  label: string;
  value: string;
}

const tag = 'clippy-language-select';

const languageOptions: Language[] = languages;

declare global {
  interface HTMLElementTagNameMap {
    [tag]: FormatSelect;
  }
}

@localized()
@safeCustomElement(tag)
export class FormatSelect extends LitElement {
  @property({ type: Boolean }) disabled = false;
  @property({ type: Boolean }) readOnly = false;
  @property({ type: Boolean }) matchTextDirection = false;

  static override readonly styles = [
    unsafeCSS(buttonCss),
    css`
      clippy-lang-combobox {
        /* overrides for clippy-lang-combobox to make it fit in the toolbar */
        --utrecht-pointer-target-min-size: var(--clippy-button-small-min-block-size);
        --utrecht-textbox-padding-block-end: 0;
        --utrecht-textbox-padding-block-start: 0;
        --utrecht-textbox-border-color: var(--nl-button-secondary-border-color);
        --utrecht-textbox-color: var(--nl-button-secondary-color);
        --utrecht-textbox-font-weight: var(--nl-button-secondary-font-weight);
        --utrecht-textbox-border-radius: var(--nl-button-border-radius);
        --utrecht-listbox-border-radius: var(--nl-button-border-radius);
        --utrecht-textbox-line-height: 30px;
      }
    `,
  ];

  @editor()
  private readonly editor: Editor | undefined;

  #lang?: string;

  @property()
  override get lang() {
    return this.#lang || sourceLocale;
  }

  override set lang(value: string) {
    this.#lang = value;
  }

  override connectedCallback(): void {
    super.connectedCallback();

    this.lang = findNearestAncestorAttribute(this.parentElement, 'lang') || sourceLocale;
  }

  #getCurrentLanguage(): string | null {
    return this.editor?.state.selection.$anchor.node().attrs['lang'] || this.#lang;
  }

  readonly #handleValueChange = (event: Event) => {
    const { value } = event.target as HTMLSelectElement;

    if (!this.editor) return;

    const currentNodeType = this.editor.state.selection.$anchor.node().type.name;

    // Unset `dir` when language is set to empty string, and `matchTextDirection` is true.

    const languageOption = languageOptions.find((option) => isSameLanguage(option.lang, value));

    this.editor.commands.updateAttributes(
      currentNodeType,
      this.matchTextDirection && languageOption?.dir ? { dir: languageOption.dir, lang: value } : { lang: value },
    );
  };

  override render() {
    return html`
      <clippy-lang-combobox
        @change=${this.#handleValueChange}
        hidden-label=${msg('Language of the element')}
        .options=${languageOptions.map(({ lang }) => lang)}
        value=${this.#getCurrentLanguage() || ''}
        format="both"
      >
      </clippy-lang-combobox>
    `;
  }
}
