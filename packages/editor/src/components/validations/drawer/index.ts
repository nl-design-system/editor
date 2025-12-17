import type { Editor } from '@tiptap/core';
import { consume } from '@lit/context';
import numberBadgeStyles from '@nl-design-system-candidate/number-badge-css/number-badge.css?inline';
import { html, LitElement, nothing, unsafeCSS } from 'lit';
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

type TipFn = (args?: Record<string, number | string | boolean>) => string | null;

type ValidationMessages = {
  [K in ValidationKey]: { description: string; href?: string; tip?: TipFn };
};

const sortByPos = (a: ValidationEntry, b: ValidationEntry) => a[1].pos - b[1].pos;

const nodeTypesTranslations: Record<string, string> = {
  definitionDescription: 'definitiebeschrijving',
  definitionTerm: 'definitieterm',
  link: 'linktekst',
  listItem: 'lijstregel',
  paragraph: 'paragraaf',
  tableCell: 'tabelcel',
  tableHeader: 'tabelkop',
};

const validationMessages: ValidationMessages = {
  [contentValidations.DEFINITION_DESCRIPTION_MUST_FOLLOW_TERM]: {
    description: 'Definitiebeschrijving moet volgen op een definitieterm',
  },
  [contentValidations.DESCRIPTION_LIST_MUST_CONTAIN_TERM]: {
    description: 'Definitielijst moet een definitieterm bevatten',
  },
  [contentValidations.HEADING_MUST_NOT_BE_EMPTY]: {
    description: 'Koptekst mag niet leeg zijn',
    href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/koppen/#voor-wie-zijn-toegankelijke-koppen-belangrijk',
  },
  [contentValidations.HEADING_SHOULD_NOT_CONTAIN_BOLD_OR_ITALIC]: {
    description: 'Koptekst mag geen vetgedrukte of cursieve tekst bevatten',
  },
  [contentValidations.IMAGE_MUST_HAVE_ALT_TEXT]: {
    description: 'Afbeelding moet alternatieve tekst hebben',
  },
  [contentValidations.LINK_SHOULD_NOT_BE_TOO_GENERIC]: {
    description: 'Linktekst mag niet te algemeen zijn',
    href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/linkteksten/',
  },
  [contentValidations.MARK_SHOULD_NOT_BE_EMPTY]: {
    description: 'Link mag niet leeg zijn',
    tip: (params) => {
      const { nodeType } = params || {};
      if (!nodeType || typeof nodeType !== 'string') {
        return null;
      }
      return `Vul de <strong>${nodeTypesTranslations[nodeType]}</strong> met tekst of verwijder de lege link.`;
    },
  },
  [contentValidations.MARK_SHOULD_NOT_BE_UNDERLINED]: {
    description: 'Tekst mag niet onderstreept zijn. Dit lijkt te veel op een link.',
    href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/tekst-benadrukken/#onderstrepen',
    tip: () => `Verwijder de onderstreping van de tekst.`,
  },
  [contentValidations.NODE_SHOULD_NOT_BE_EMPTY]: {
    description: 'Vermijd lege elementen',
    tip: (params) => {
      const { nodeType } = params || {};
      if (!nodeType || typeof nodeType !== 'string') {
        return null;
      }
      return `Verwijder de lege <strong>${nodeTypesTranslations[nodeType]}</strong> of voeg tekst toe.`;
    },
  },
  [documentValidations.DOCUMENT_MUST_HAVE_CORRECT_HEADING_ORDER]: {
    description: 'Document moet correcte kopvolgorde hebben',
    href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/koppen/#kopniveaus',
    tip: (params) => {
      const { exceedsTopLevel, headingLevel, precedingHeadingLevel } = params || {};

      if (exceedsTopLevel) {
        return `<strong>Kopniveau ${headingLevel}</strong> overschrijdt het hoogste toegestane kopniveau (${precedingHeadingLevel}) in dit document.`;
      }

      if (typeof precedingHeadingLevel !== 'number' || !headingLevel) {
        return null;
      }

      if (precedingHeadingLevel === 0) {
        return `<strong>Kopniveau ${headingLevel}</strong> mag niet het eerste kopniveau in het document zijn.`;
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
  [documentValidations.DOCUMENT_MUST_HAVE_SINGLE_HEADING_ONE]: {
    description: 'Document mag maar één kopniveau 1 hebben',
    href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/koppen',
  },
  [documentValidations.DOCUMENT_MUST_HAVE_TABLE_WITH_HEADINGS]: {
    description: 'Tabel moet kopteksten bevatten',
  },
  [documentValidations.DOCUMENT_MUST_HAVE_TABLE_WITH_MULTIPLE_ROWS]: {
    description: 'Tabel moet meerdere rijen bevatten',
  },
  [documentValidations.DOCUMENT_MUST_HAVE_TOP_LEVEL_HEADING_ONE]: {
    description: 'Document moet starten met het kopniveau 1',
  },
  [documentValidations.DOCUMENT_SHOULD_NOT_HAVE_HEADING_RESEMBLING_PARAGRAPHS]: {
    description: 'Paragraaf die op een koptekst lijkt vermijden',
    href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/koppen/#opmaak-van-koppen',
  },
} as const;

@customElement('clippy-validations-dialog')
export class ValidationsDialog extends LitElement {
  static override readonly styles = [dialogStyles, unsafeCSS(numberBadgeStyles)];
  @state()
  private open = false;

  @queryAll('clippy-validation-list-item')
  private readonly validationListItems: HTMLUListElement[] | undefined;

  @consume({ context: tiptapContext, subscribe: true })
  @property({ attribute: false })
  public editor?: Editor;

  @consume({ context: validationsContext, subscribe: true })
  @property({ attribute: false })
  validationsContext?: ValidationsMap;

  readonly #dialogRef: Ref<HTMLDialogElement> = createRef();

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

  readonly #toggleOpenAndFocus = (event: CustomEventInit<{ key: string }>) => {
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

  readonly #toggleOpen = () => {
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
    const sortedValidations = validations.slice().sort(sortByPos);

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
                    ${tipHtml ? html`<div slot="tip-html">${unsafeHTML(tipHtml)}</div>` : nothing}
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
