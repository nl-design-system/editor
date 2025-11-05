import type { Editor } from '@tiptap/core';
import { consume } from '@lit/context';
import numberBadgeStyles from '@nl-design-system-candidate/number-badge-css/number-badge.css?inline';
import AlertIcon from '@tabler/icons/outline/alert-circle.svg?raw';
import ExclamationIcon from '@tabler/icons/outline/exclamation-circle.svg?raw';
import { html, LitElement, type TemplateResult, unsafeCSS } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import { createRef, ref, type Ref } from 'lit/directives/ref.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import type { ValidationsMap } from '@/types/validation.ts';
import { tiptapContext } from '@/context/tiptapContext.ts';
import { validationsContext } from '@/context/validationsContext.ts';
import { CustomEvents } from '@/events';
import { contentValidations, documentValidations } from '@/validators/constants.ts';
import dialogStyles from './styles.ts';

type ContentValidationKey = (typeof contentValidations)[keyof typeof contentValidations];
type DocumentValidationKey = (typeof documentValidations)[keyof typeof documentValidations];
type ValidationKey = ContentValidationKey | DocumentValidationKey;

type TipFn = (args?: Record<string, number | string>) => TemplateResult | null;

type ValidationMessages = {
  [K in ValidationKey]: { description: string; href?: string; tip?: TipFn };
};

const validationMessages: ValidationMessages = {
  [contentValidations.HEADING_MUST_NOT_BE_EMPTY]: {
    description: 'Koptekst mag niet leeg zijn',
    href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/koppen/#voor-wie-zijn-toegankelijke-koppen-belangrijk',
  },
  [contentValidations.PARAGRAPH_MUST_NOT_BE_EMPTY]: {
    description: 'Paragraaf mag niet leeg zijn',
  },
  [documentValidations.DOCUMENT_MUST_HAVE_CORRECT_HEADING_ORDER]: {
    description: 'Document moet correcte kopvolgorde hebben',
    href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/koppen/#kopniveaus',
    tip: (params) => {
      const { headingLevel, precedingHeadingLevel } = params || {};
      if (typeof precedingHeadingLevel !== 'number' || !headingLevel) {
        return null;
      }
      return html`<strong>Kopniveau ${headingLevel}</strong> mag niet direct volgen op een
        <strong>kopniveau ${precedingHeadingLevel}</strong>. Gebruik een koptekst op niveau ${precedingHeadingLevel + 1}
        of lager.`;
    },
  },
  [documentValidations.DOCUMENT_MUST_HAVE_HEADING_1]: {
    description: 'Document moet een kopniveau 1 bevatten',
  },
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

  #dialogRef: Ref<HTMLDialogElement> = createRef();

  override connectedCallback() {
    super.connectedCallback();
    globalThis.addEventListener(CustomEvents.OPEN_VALIDATIONS_DIALOG, this.#toggleOpen);
  }

  override disconnectedCallback() {
    globalThis.removeEventListener(CustomEvents.OPEN_VALIDATIONS_DIALOG, this.#toggleOpen);
    super.disconnectedCallback();
  }

  #toggleOpen = () => {
    const { value } = this.#dialogRef;
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
        ${ref(this.#dialogRef)}
        id="dialog-content"
        class="clippy-dialog__content"
        aria-label="Toegankelijkheidsfouten"
      >
        <ul class="clippy-dialog__list">
          ${size > 0
            ? map(this.validationsContext?.entries(), ([key, { pos, severity, tipPayload }]) => {
                const { description, href, tip } = validationMessages[key as ValidationKey];
                console.log(href);
                const tipHtml = tip?.(tipPayload);
                return html`<li class="clippy-dialog__list-item" xmlns="http://www.w3.org/1999/html" tabindex="0">
                  <div class="clippy-dialog__list-item-message">
                    <span class="clippy-dialog__list-item-severity clippy-dialog__list-item-severity--${severity}">
                      ${severity === 'warning' ? unsafeSVG(AlertIcon) : unsafeSVG(ExclamationIcon)}
                    </span>
                    ${description} (${severityLevels[severity]})
                  </div>
                  ${tipHtml ? html`<div>${tipHtml}</div>` : null}
                  ${href
                    ? html`
                        <div class="clippy-dialog__list-item-link">
                          <utrecht-link href="${href}" target="_blank"> Uitgebreide toelichting </utrecht-link>
                        </div>
                      `
                    : null}
                  <div class="clippy-dialog__list-item-actions">
                    <utrecht-button disabled="true">Negeren</utrecht-button>
                    <utrecht-button appearance="secondary-action-button" @click=${() => this.#focusNode(pos)}
                      >Aanpassen</utrecht-button
                    >
                  </div>
                </li>`;
              })
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
