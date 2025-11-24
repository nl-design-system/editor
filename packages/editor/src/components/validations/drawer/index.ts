import type { Editor } from '@tiptap/core';
import { consume } from '@lit/context';
import numberBadgeStyles from '@nl-design-system-candidate/number-badge-css/number-badge.css?inline';
import { html, LitElement, unsafeCSS } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { queryAll } from 'lit/decorators/query-all.js';
import { map } from 'lit/directives/map.js';
import { createRef, ref, type Ref } from 'lit/directives/ref.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import type { ValidationEntry, ValidationsMap } from '@/types/validation.ts';
import { tiptapContext } from '@/context/tiptapContext.ts';
import { validationsContext } from '@/context/validationsContext.ts';
import { CustomEvents } from '@/events';
import { contentValidations, documentValidations } from '@/validators/constants.ts';
import './validation-list-item';
import dialogStyles from './styles.ts';

type ContentValidationKey = (typeof contentValidations)[keyof typeof contentValidations];
type DocumentValidationKey = (typeof documentValidations)[keyof typeof documentValidations];
type ValidationKey = ContentValidationKey | DocumentValidationKey;

type TipFn = (args?: Record<string, number | string>) => string | null;

type ValidationMessages = {
  [K in ValidationKey]: { description: string; href?: string; tip?: TipFn };
};

const sortByPos = (a: ValidationEntry, b: ValidationEntry) => a[1].pos - b[1].pos;

const nodeTypesTranslations: Record<string, string> = {
  definitionDescription: 'definitiebeschrijving',
  definitionTerm: 'definitieterm',
  listItem: 'lijstregel',
  paragraph: 'paragraaf',
  tableCell: 'tabelcel',
  tableHeader: 'tabelkop',
};

const validationMessages: ValidationMessages = {
  [contentValidations.HEADING_MUST_NOT_BE_EMPTY]: {
    description: 'Koptekst mag niet leeg zijn',
    href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/koppen/#voor-wie-zijn-toegankelijke-koppen-belangrijk',
  },
  [contentValidations.IMAGE_MUST_HAVE_ALT_TEXT]: {
    description: 'Afbeelding moet alternatieve tekst hebben',
  },
  [contentValidations.NODE_SHOULD_NOT_BE_EMPTY]: {
    description: 'Vermijd lege elementen',
    tip: (params) => {
      const { nodeType } = params || {};
      if (!nodeType) {
        return null;
      }
      return `Verwijder de lege <strong>${nodeTypesTranslations[nodeType]}</strong> of voeg tekst toe.`;
    },
  },
  [documentValidations.DOCUMENT_MUST_HAVE_CORRECT_HEADING_ORDER]: {
    description: 'Document moet correcte kopvolgorde hebben',
    href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/koppen/#kopniveaus',
    tip: (params) => {
      const { headingLevel, precedingHeadingLevel } = params || {};
      if (typeof precedingHeadingLevel !== 'number' || !headingLevel) {
        return null;
      }
      return `<strong>Kopniveau ${headingLevel}</strong> mag niet direct volgen op een
        <strong>kopniveau ${precedingHeadingLevel}</strong>. Gebruik een koptekst op niveau ${precedingHeadingLevel + 1}
        of lager.`;
    },
  },
  [documentValidations.DOCUMENT_MUST_HAVE_SEMANTIC_LISTS]: {
    description: 'Lijst moet een semantische lijst zijn',
    href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/opsommingen/#genummerde-en-ongenummerde-lijsten',
    tip: (params) => {
      const { prefix } = params || {};
      if (!prefix) {
        return null;
      }
      return `Gebruik een semantische lijst in plaats van regels die beginnen met "<strong>${prefix}</strong>"`;
    },
  },
  [documentValidations.DOCUMENT_MUST_HAVE_TOP_LEVEL_HEADING]: {
    description: 'Document moet starten met het juiste kopniveau',
    tip: (params) => {
      const { topHeadingLevel } = params || {};
      return `Verwachting: <strong>kopniveau ${topHeadingLevel ?? 1}</strong>`;
    },
  },
} as const;

@customElement('clippy-validations-dialog')
export class ValidationsDialog extends LitElement {
  static override readonly styles = [dialogStyles, unsafeCSS(numberBadgeStyles)];
  @state()
  private open = false;

  @queryAll('clippy-validation-list-item')
  private validationListItems: HTMLUListElement[] | undefined;

  @consume({ context: tiptapContext, subscribe: true })
  @property({ attribute: false })
  public editor?: Editor;

  @consume({ context: validationsContext, subscribe: true })
  @property({ attribute: false })
  validationsContext?: ValidationsMap;

  #dialogRef: Ref<HTMLDialogElement> = createRef();

  override connectedCallback() {
    super.connectedCallback();
    globalThis.addEventListener(CustomEvents.OPEN_VALIDATIONS_DIALOG, this.#toggleOpenAndFocus);
    globalThis.addEventListener(CustomEvents.FOCUS_NODE, this.#focusNode);
  }

  override disconnectedCallback() {
    globalThis.removeEventListener(CustomEvents.OPEN_VALIDATIONS_DIALOG, this.#toggleOpenAndFocus);
    globalThis.removeEventListener(CustomEvents.FOCUS_NODE, this.#focusNode);
    super.disconnectedCallback();
  }

  #toggleOpenAndFocus = (event: CustomEventInit<{ key: string }>) => {
    if (event.detail?.key) {
      if (!this.open) {
        this.#toggleOpen();
      }
      this.validationListItems?.forEach((el) => {
        const listItem = el.shadowRoot?.querySelector(`[data-validation-key="${event.detail?.key}"]`);
        if (listItem instanceof HTMLElement) listItem.focus();
      });
    } else {
      this.#toggleOpen();
    }
  };

  #toggleOpen = () => {
    const { value } = this.#dialogRef;
    if (this.open) {
      value?.close();
    } else {
      value?.show();
    }
    this.open = !this.open;
  };

  readonly #focusNode = (event: CustomEventInit<{ pos: number }>) => {
    const { pos = 0 } = event.detail || {};
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
  };

  override render() {
    const { size = 0 } = this.validationsContext || {};
    const validations = [...(this.validationsContext?.entries() ?? [])];
    const sortedValidations = validations.sort(sortByPos);

    return html`
      <dialog
        ${ref(this.#dialogRef)}
        id="dialog-content"
        class="clippy-dialog__content"
        aria-label="Toegankelijkheidsfouten"
      >
        <ul class="clippy-dialog__list" id="validation-list">
          ${size > 0
            ? map(sortedValidations, ([key, { pos, severity, tipPayload }]) => {
                const validationKey = key.split('_')[0] as ValidationKey;
                const { description, href, tip } = validationMessages[validationKey];
                const tipHtml = tip?.(tipPayload) ?? null;
                return html`
                  <clippy-validation-list-item
                    .key=${key}
                    .pos=${pos}
                    .severity=${severity}
                    .description=${description}
                    .href=${href}
                  >
                    <div slot="tip-html">${unsafeHTML(tipHtml!)}</div>
                  </clippy-validation-list-item>
                `;
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
