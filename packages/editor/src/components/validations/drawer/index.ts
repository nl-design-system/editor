import type { Editor } from '@tiptap/core';
import { consume } from '@lit/context';
import numberBadgeStyles from '@nl-design-system-candidate/number-badge-css/number-badge.css?inline';
import AlertIcon from '@tabler/icons/outline/alert-circle.svg?raw';
import ExclamationIcon from '@tabler/icons/outline/exclamation-circle.svg?raw';
import { html, LitElement, unsafeCSS } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import { createRef, ref, type Ref } from 'lit/directives/ref.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import { tiptapContext } from '@/context/tiptapContext.ts';
import { validationsContext, type ValidationsMap } from '@/context/validationsContext.ts';
import { CustomEvents } from '@/events';
import dialogStyles from './styles.ts';

const validationMessages: Record<string, string> = {
  'heading-must-not-be-empty': 'Koptekst mag niet leeg zijn',
} as const;

const severityLevels: Record<'info' | 'warning' | 'error', string> = {
  error: 'Fout',
  info: 'Info',
  warning: 'Waarschuwing',
};

@customElement('clippy-validations-dialog')
export class ValidationsDialog extends LitElement {
  static override readonly styles = [dialogStyles, unsafeCSS(numberBadgeStyles)];
  @state()
  private open = false;

  @consume({ context: tiptapContext })
  @property({ attribute: false })
  public editor?: Editor;

  @consume({ context: validationsContext, subscribe: true })
  @property({ attribute: false })
  validationsContext?: ValidationsMap;

  private dialogRef: Ref<HTMLDialogElement> = createRef();

  override connectedCallback() {
    super.connectedCallback();
    window.addEventListener(CustomEvents.OPEN_VALIDATIONS_DIALOG, this.#toggleOpen);
  }

  override disconnectedCallback() {
    window.removeEventListener(CustomEvents.OPEN_VALIDATIONS_DIALOG, this.#toggleOpen);
    super.disconnectedCallback();
  }

  #toggleOpen = () => {
    const { value } = this.dialogRef;
    if (this.open) {
      value?.close();
    } else {
      value?.show();
    }
    this.open = !this.open;
  };

  #focusNode(pos: number) {
    try {
      const { view } = this.editor || {};
      const nodeDom = view?.nodeDOM?.(pos) ?? view?.domAtPos(pos).node;
      if (nodeDom instanceof HTMLElement) {
        nodeDom.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      // Set a text selection at the position and focus the view
      this.editor?.commands.focus(pos);
      this.#toggleOpen();
    } catch (err) {
      console.error('Cannot scroll to and focus node', err);
    }
  }

  override render() {
    const { size = 0 } = this.validationsContext || {};
    return html`
      <dialog
        ${ref(this.dialogRef)}
        id="dialog-content"
        class="clippy-dialog__content"
        aria-label="Toegankelijkheidsfouten"
      >
        <ul class="clippy-dialog__list">
          ${size > 0
            ? map(
                this.validationsContext?.entries(),
                ([, { id, pos, severity }]) =>
                  html` <li class="clippy-dialog__list-item" xmlns="http://www.w3.org/1999/html" tabindex="0">
                    <div class="clippy-dialog__list-item-message">
                      <span class="clippy-dialog__list-item-severity clippy-dialog__list-item-severity--${severity}">
                        ${severity === 'warning' ? unsafeSVG(AlertIcon) : unsafeSVG(ExclamationIcon)}
                      </span>
                      ${validationMessages[id]} (${severityLevels[severity]})
                    </div>
                    <div class="clippy-dialog__list-item-link">
                      <utrecht-link
                        href="https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/koppen/#voor-wie-zijn-toegankelijke-koppen-belangrijk"
                        target="_blank"
                      >
                        Uitgebreide toelichting
                      </utrecht-link>
                    </div>
                    <div class="clippy-dialog__list-item-actions">
                      <utrecht-button disabled="true">Negeren</utrecht-button>
                      <utrecht-button appearance="secondary-action-button" @click=${() => this.#focusNode(pos)}
                        >Aanpassen</utrecht-button
                      >
                    </div>
                  </li>`,
              )
            : html`<li class="clippy-dialog__list-item">Geen toegankelijkheidsfouten gevonden.</li>`}
        </ul>
      </dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'clippy-validations-dialog': ValidationsDialog;
  }
}
