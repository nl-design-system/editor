import type { Editor } from '@tiptap/core';
import { consume } from '@lit/context';
import { localized, msg } from '@lit/localize';
import AlignCenterIcon from '@tabler/icons/outline/align-center.svg?raw';
import AlignJustifiedIcon from '@tabler/icons/outline/align-justified.svg?raw';
import AlignLeftIcon from '@tabler/icons/outline/align-left.svg?raw';
import AlignRightIcon from '@tabler/icons/outline/align-right.svg?raw';
import ChevronDownIcon from '@tabler/icons/outline/chevron-down.svg?raw';
import { html, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import { tiptapContext } from '@/context/tiptapContext.ts';
import toolbarTextAlignStyles from './styles.ts';

const tag = 'clippy-toolbar-text-align';

const alignments = ['left', 'center', 'right', 'justify'] as const;

type Alignment = (typeof alignments)[number];

declare global {
  interface HTMLElementTagNameMap {
    [tag]: ToolbarTextAlign;
  }
}

const iconMap: Record<Alignment, string> = {
  center: AlignCenterIcon,
  justify: AlignJustifiedIcon,
  left: AlignLeftIcon,
  right: AlignRightIcon,
};

@localized()
@customElement(tag)
export class ToolbarTextAlign extends LitElement {
  @consume({ context: tiptapContext, subscribe: true })
  editor?: Editor;

  static override readonly styles = [toolbarTextAlignStyles];

  @state()
  private open = false;

  #getAlignmentLabel(alignment: Alignment): string {
    const labels: Record<Alignment, string> = {
      center: msg('Center'),
      justify: msg('Justify'),
      left: msg('Align left'),
      right: msg('Align right'),
    };
    return labels[alignment];
  }

  #toggleBubbleMenu(): void {
    this.open = !this.open;
  }

  #closeMenu(): void {
    this.open = false;
  }

  #setAlignment(alignment: Alignment): void {
    this.editor?.chain().focus().toggleTextAlign(alignment).run();
    this.#closeMenu();
  }

  #getActiveAlignment(): Alignment {
    return alignments.find((alignment) => this.editor?.isActive({ textAlign: alignment })) || 'left';
  }

  #handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.#closeMenu();
    }
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('keydown', this.#handleKeydown);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('keydown', this.#handleKeydown);
  }

  override render() {
    const activeAlignment = this.#getActiveAlignment();

    return html`
      <clippy-button @click=${this.#toggleBubbleMenu} size="small" purpose="secondary" icon-only>
        <clippy-icon slot="iconStart">${unsafeSVG(iconMap[activeAlignment])}</clippy-icon>
        ${this.#getAlignmentLabel(activeAlignment)}
        <clippy-icon slot="iconEnd" class="clippy-icon__dropdown">${unsafeSVG(ChevronDownIcon)}</clippy-icon>
      </clippy-button>

      ${this.open
        ? html`
            <div role="menu" aria-label="Tekstuitlijning" class="clippy-toolbar-text-align__menu">
              ${alignments.map(
                (alignment) => html`
                  <clippy-button
                    @click=${() => this.#setAlignment(alignment)}
                    .pressed=${activeAlignment === alignment}
                    size="small"
                    purpose="secondary"
                    toggle
                    icon-only
                    style="display: block; width: 100%;"
                  >
                    <clippy-icon slot="iconStart">${unsafeSVG(iconMap[alignment])}</clippy-icon>
                    ${this.#getAlignmentLabel(alignment)}
                  </clippy-button>
                `,
              )}
            </div>
          `
        : null}
    `;
  }
}
