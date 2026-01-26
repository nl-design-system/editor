import type { Editor } from '@tiptap/core';
import buttonCss from '@nl-design-system-candidate/button-css/button.css?inline';
import { css, html, LitElement, unsafeCSS } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import { editor } from '@/decorators/TipTapDecorator.ts';
import { findNearestAncestorAttribute } from '@/utils/domTraverser.ts';
import { languages, isSameLanguage, type Language } from './languages.ts';

export interface SelectOption {
  active: boolean;
  label: string;
  value: string;
}

const tag = 'clippy-language-select';

const languageOptions: Language[] = [...languages, { dir: null, i18n: {}, lang: '' }];

const DEFAULT_LANG = 'en';

declare global {
  interface HTMLElementTagNameMap {
    [tag]: FormatSelect;
  }
}

@customElement(tag)
export class FormatSelect extends LitElement {
  @property({ type: Boolean }) disabled = false;
  @property({ type: Boolean }) readOnly = false;
  @property({ type: Boolean }) matchTextDirection = false;
  @property({ type: Function }) onSelect = (value: string) => value;
  static override readonly styles = [
    unsafeCSS(buttonCss),
    css`
      .clippy-button--small {
        --nl-button-min-inline-size: var(--clippy-button-small-min-inline-size, 32px);
        --nl-button-min-block-size: var(--clippy-button-small-min-block-size, 32px);
        --clippy-icon-size: var(--clippy-button-small-icon, 18px);
        padding-block-end: 0;
        padding-block-start: 0;
      }
    `,
  ];

  @editor()
  private readonly editor: Editor | undefined;

  #lang?: string;

  @property()
  override get lang() {
    return this.#lang || DEFAULT_LANG;
  }

  override set lang(value: string) {
    this.#lang = value;
  }

  override connectedCallback(): void {
    super.connectedCallback();

    this.lang = findNearestAncestorAttribute(this.parentElement, 'lang') || DEFAULT_LANG;
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

  @state()
  private get options(): SelectOption[] {
    if (!this.editor) return [];

    const currentLanguage = this.#getCurrentLanguage();

    // Currently the lists only consists of the official European languages in 2025,
    // plus Arabic and Hebrew as testing languages for right-to-left,
    // and with labels in English.
    // The list should be expanded to include the associated writing direction (dir: "rtl" or dir: "ltr"),
    // the label of the language in the language itself, and to have all ISO-639-1 languages.

    let options = languageOptions.map(({ i18n: { en }, lang }) => ({
      active: isSameLanguage(lang, currentLanguage ?? ''),
      label: en,
      value: lang,
    }));

    // When the currently active value is not included in our options,
    // temporarily include an option for the active language, to avoid
    // displaying an option.
    if (!options.some(({ active }) => active)) {
      options = [
        {
          active: true,
          label: '(onbekend)',
          value: '',
        },
        ...options,
      ];
    }

    return options;
  }

  override render() {
    return html`
      <select
        class="nl-button nl-button--secondary clippy-button--small"
        @change=${this.#handleValueChange}
        aria-label="Taal van het onderdeel"
      >
        ${map(
          this.options,
          (option) => html`<option ?selected=${option.active} value=${option.value}>${option.label}</option>`,
        )}
      </select>
    `;
  }
}
