import type { Editor } from '@tiptap/core';
import type { Level } from '@tiptap/extension-heading';
import { consume } from '@lit/context';
import { html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import { tiptapContext } from '@/context/tiptapContext.ts';
import buttonStyles from './../toolbar-button/styles.ts';

export interface SelectOption {
  active: boolean;
  label: string;
  value: string;
}

const getConfiguredHeadingLevels = (editor: Editor): Level[] => {
  const headingExt = editor.extensionManager.extensions.find((ext) => ext.name === 'heading');
  return headingExt?.options.levels;
};

@customElement('clippy-format-select')
export class FormatSelect extends LitElement {
  @property({ type: Boolean }) disabled = false;
  @property({ type: Boolean }) readOnly = false;
  @property({ type: Function }) onSelect = (value: string) => value;
  @consume({ context: tiptapContext, subscribe: true })
  @property({ attribute: false })
  public editor?: Editor;
  static override readonly styles = [buttonStyles];

  #isFormatActive(name: string, attributes?: Record<'level', number>): boolean {
    return this.editor?.isActive(name, attributes) ?? false;
  }

  readonly #handleTextFormatChange = (event: Event) => {
    const { value } = event.target as HTMLSelectElement;

    if (!value || !this.editor) return;

    const chain = this.editor.chain().focus();

    const formatCommands: Record<string, () => typeof chain> = {
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

  readonly #onUpdate = () => {
    this.requestUpdate();
  };

  override connectedCallback() {
    super.connectedCallback();
    this.editor?.on('transaction', this.#onUpdate);
  }

  override disconnectedCallback() {
    this.editor?.off('transaction', this.#onUpdate);
    super.disconnectedCallback();
  }

  @state()
  private get options(): SelectOption[] {
    if (!this.editor) return [];
    const headingLevels = getConfiguredHeadingLevels(this.editor);
    const headingOptions: SelectOption[] = headingLevels.map((level) => ({
      active: this.#isFormatActive('heading', { level }),
      label: `Kopniveau ${level}`,
      value: `h${level}`,
    }));
    return [
      ...headingOptions,
      {
        active: this.#isFormatActive('paragraph'),
        label: 'Paragraaf',
        value: 'paragraph',
      },
    ];
  }

  override render() {
    return html`
      <select class="clippy-toolbar-button" @change=${this.#handleTextFormatChange}>
        ${map(
          this.options,
          (option) => html`<option ?selected=${option.active} value=${option.value}>${option.label}</option>`,
        )}
      </select>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'clippy-format-select': FormatSelect;
  }
}
