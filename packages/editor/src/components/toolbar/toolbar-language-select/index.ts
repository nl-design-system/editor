import type { Editor } from '@tiptap/core';
import '@nl-design-system-community/clippy-components/clippy-lang-combobox';
import { localized } from '@lit/localize';
import buttonCss from '@nl-design-system-candidate/button-css/button.css?inline';
import LanguageIcon from '@tabler/icons/outline/language.svg?raw';
import { html, LitElement, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import { safeCustomElement } from '@/decorators/SafeCustomElementDecorator.ts';
import { editor } from '@/decorators/TipTapDecorator.ts';
import { sourceLocale } from '@/generated/locale-codes.ts';
import { findNearestAncestorAttribute } from '@/utils/domTraverser.ts';
import { languages, isSameLanguage, type Language } from './languages.ts';
import toolbarLanguageSelectStyles from './styles.ts';

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

  static override readonly styles = [toolbarLanguageSelectStyles, unsafeCSS(buttonCss)];

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
        .options=${languageOptions.map(({ lang }) => lang)}
        value=${this.#getCurrentLanguage() ?? ''}
      >
        <div slot="icon-start">${unsafeSVG(LanguageIcon)}</div>
      </clippy-lang-combobox>
    `;
  }
}
