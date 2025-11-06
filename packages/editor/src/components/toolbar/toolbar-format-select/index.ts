import type { Editor } from '@tiptap/core';
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

/**
 * @summary Clippy format select component
 * @attr {boolean} disabled - Whether the select is disabled
 * @attr {boolean} readonly - Whether the select is readOnly
 * @attr {function} onSelect - Callback function when an option is selected
 */
@customElement('clippy-format-select')
export class FormatSelect extends LitElement {
  @property({ reflect: true, type: Boolean }) disabled = false;
  @property({ reflect: true, type: Boolean }) readonly = false;
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

  readonly #onUpdate = () => this.requestUpdate();

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
    return [
      {
        active: this.#isFormatActive('heading', { level: 1 }),
        label: 'Kopniveau 1',
        value: 'h1',
      },
      {
        active: this.#isFormatActive('heading', { level: 2 }),
        label: 'Kopniveau 2',
        value: 'h2',
      },
      {
        active: this.#isFormatActive('heading', { level: 3 }),
        label: 'Kopniveau 3',
        value: 'h3',
      },
      {
        active: this.#isFormatActive('heading', { level: 4 }),
        label: 'Kopniveau 4',
        value: 'h4',
      },
      {
        active: this.#isFormatActive('heading', { level: 5 }),
        label: 'Kopniveau 5',
        value: 'h5',
      },
      {
        active: this.#isFormatActive('heading', { level: 6 }),
        label: 'Kopniveau 6',
        value: 'h6',
      },
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
