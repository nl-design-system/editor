import type { Editor } from '@tiptap/core';
import type { Level } from '@tiptap/extension-heading';
import { localized, msg, str } from '@lit/localize';
import { css, html, LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import { safeCustomElement } from '@/decorators/SafeCustomElementDecorator.ts';
import '@nl-design-system-community/clippy-components/clippy-combobox';
import { editor } from '@/decorators/TipTapDecorator.ts';

const tag = 'clippy-format-select';

declare global {
  interface HTMLElementTagNameMap {
    [tag]: FormatSelect;
  }
}

export interface SelectOption {
  label: string;
  value: string;
}

const getConfiguredHeadingLevels = (editor: Editor): Level[] => {
  const headingExt = editor.extensionManager.extensions.find((ext) => ext.name === 'heading');
  return headingExt?.options.levels;
};

@localized()
@safeCustomElement(tag)
export class FormatSelect extends LitElement {
  @property({ type: Boolean }) disabled = false;
  @property({ type: Boolean }) readOnly = false;
  static override readonly styles = [
    css`
      clippy-combobox {
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

  #isFormatActive(name: string, attributes?: Record<'level', number>): boolean {
    return this.editor?.isActive(name, attributes) ?? false;
  }

  readonly #handleTextFormatChange = (event: Event) => {
    const { value } = event.target as HTMLSelectElement;

    if (!value || !this.editor) return;

    const chain = this.editor.chain().focus();

    const formatCommands: Record<string, () => typeof chain> = {
      blockquote: () => chain.toggleBlockquote(),
      codeBlock: () => chain.setCodeBlock(),
      h1: () => chain.toggleHeading({ level: 1 }),
      h2: () => chain.toggleHeading({ level: 2 }),
      h3: () => chain.toggleHeading({ level: 3 }),
      h4: () => chain.toggleHeading({ level: 4 }),
      h5: () => chain.toggleHeading({ level: 5 }),
      h6: () => chain.toggleHeading({ level: 6 }),
      paragraph: () => chain.setParagraph(),
    };
    formatCommands[value]().run();
  };

  @state()
  private get options(): SelectOption[] {
    if (!this.editor) return [];
    const headingLevels = getConfiguredHeadingLevels(this.editor);
    return [
      ...headingLevels.map((level) => ({
        label: msg(str`Heading level ${level}`),
        value: `h${level}`,
      })),
      { label: msg('Paragraph'), value: 'paragraph' },
      { label: msg('Code block'), value: 'codeBlock' },
      { label: msg('Blockquote'), value: 'blockquote' },
    ];
  }

  get #selectedIndex(): number {
    return this.options.findIndex(({ value }) => {
      if (value.startsWith('h')) {
        const level = Number(value[1]);
        return this.#isFormatActive('heading', { level });
      }
      return this.#isFormatActive(value);
    });
  }

  override render() {
    return html`
      <clippy-combobox
        @change=${this.#handleTextFormatChange}
        hidden-label=${msg('Select text format')}
        value=${this.options[this.#selectedIndex]?.value || ''}
        .selectedIndex=${this.#selectedIndex}
        .options=${this.options}
      ></clippy-combobox>
    `;
  }
}
