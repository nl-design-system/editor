import type { Editor } from '@tiptap/core';
import { consume } from '@lit/context';
import { localized, msg } from '@lit/localize';
import numberBadgeStyles from '@nl-design-system-candidate/number-badge-css/number-badge.css?inline';
import paragraphStyle from '@nl-design-system-candidate/paragraph-css/paragraph.css?inline';
import { safeCustomElement } from '@nl-design-system-community/clippy-components/lib/decorators';
import LanguageIcon from '@tabler/icons/outline/language.svg?raw';
import LinkIcon from '@tabler/icons/outline/link.svg?raw';
import ListIcon from '@tabler/icons/outline/list.svg?raw';
import X from '@tabler/icons/outline/x.svg?raw';
import { html, LitElement, nothing, unsafeCSS } from 'lit';
import { property, state } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import { createRef, ref, type Ref } from 'lit/directives/ref.js';
import '../validation-item';
import '../../content-views/heading-structure';
import '../../content-views/link-list';
import '../../content-views/language-changes';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import type { ValidationsMap, ValidationResult, ValidationSeverity } from '@/types/validation.ts';
import { identifierContext } from '@/context/identifierContext.ts';
import '@/components/tabs';
import '@nl-design-system-community/clippy-components/clippy-button';
import '@nl-design-system-community/clippy-components/clippy-icon';
import { tiptapContext } from '@/context/tiptapContext.ts';
import { validationsContext } from '@/context/validationsContext.ts';
import {
  CustomEvents,
  type CorrectValidationIssueEvent,
  type DocumentOverviewMode,
  type FocusNodeEvent,
  type OpenDocumentOverviewDetail,
  type OpenValidationsDialogEvent,
} from '@/events';
import { validationMessages, type ValidationKey } from '@/messages';
import type { ValidationItem } from '../validation-item';
import dialogStyles from './styles.ts';

/**
 * Slide-in drawer dialog that lists all accessibility validation results and
 * provides document overview panels (heading structure, link list, language
 * changes). Opens and closes in response to the global
 * `CustomEvents.OPEN_VALIDATIONS_DIALOG` event, scoped to the current editor
 * identifier.
 *
 * @tag clippy-validations-dialog
 *
 * @fires {OpenValidationsDialogEvent} OPEN_VALIDATIONS_DIALOG - Listens for this event to
 *   toggle the dialog open state.
 * @fires {CustomEvent} TAB_CHANGE - Listens to filter the displayed validations
 *   by severity.
 *
 * @example
 * ```html
 * <clippy-validations-dialog></clippy-validations-dialog>
 * ```
 */
@localized()
@safeCustomElement('clippy-validations-dialog')
export class ValidationsDialog extends LitElement {
  static override readonly styles = [dialogStyles, unsafeCSS(numberBadgeStyles), unsafeCSS(paragraphStyle)];
  @state()
  private open = false;

  @state()
  private selectedSeverity: ValidationSeverity | null = null;

  @state()
  private _overviewMode: DocumentOverviewMode | null = null;

  @consume({ context: identifierContext, subscribe: true })
  @property({ attribute: false })
  private readonly identifier?: string;

  @consume({ context: tiptapContext, subscribe: true })
  @property({ attribute: false })
  public editor?: Editor;

  @consume({ context: validationsContext, subscribe: true })
  @property({ attribute: false })
  validationsContext?: ValidationsMap;

  readonly #dialogRef: Ref<HTMLDialogElement> = createRef();

  override connectedCallback() {
    super.connectedCallback();
    globalThis.addEventListener(CustomEvents.CORRECT_VALIDATION_ISSUE, this.#closeDialog);
    globalThis.addEventListener(CustomEvents.OPEN_VALIDATIONS_DIALOG, this.#toggleOpen);
    globalThis.addEventListener(CustomEvents.TAB_CHANGE, this.#handleTabChange);
    globalThis.addEventListener(CustomEvents.FOCUS_NODE, this.#focusNode);
    globalThis.addEventListener(CustomEvents.FOCUS_VALIDATION_ITEM_IN_DRAWER, this.#focusValidationItem);
    globalThis.addEventListener(CustomEvents.OPEN_DOCUMENT_OVERVIEW, this.#handleOverviewOpen);
  }

  override disconnectedCallback() {
    globalThis.removeEventListener(CustomEvents.CORRECT_VALIDATION_ISSUE, this.#closeDialog);
    globalThis.removeEventListener(CustomEvents.OPEN_VALIDATIONS_DIALOG, this.#toggleOpen);
    globalThis.removeEventListener(CustomEvents.FOCUS_NODE, this.#focusNode);
    globalThis.removeEventListener(CustomEvents.FOCUS_VALIDATION_ITEM_IN_DRAWER, this.#focusValidationItem);
    globalThis.removeEventListener(CustomEvents.OPEN_DOCUMENT_OVERVIEW, this.#handleOverviewOpen);
    super.disconnectedCallback();
  }

  readonly #closeDialog = (event: Event) => {
    if (event instanceof CustomEvent) {
      const eventIdentifier = (event as CorrectValidationIssueEvent).detail?.identifier;
      if (eventIdentifier !== this.identifier) return;
    }
    if (this.open) {
      this.#dialogRef.value?.close();
      this.open = false;
    }
  };

  readonly #toggleOpen = (event?: Event) => {
    // When triggered from a global event, only respond if the identifier matches this instance
    if (event instanceof CustomEvent) {
      const eventIdentifier = (event as OpenValidationsDialogEvent).detail?.identifier;
      if (eventIdentifier !== this.identifier) return;
    }
    const { value } = this.#dialogRef;
    if (this.open) {
      value?.close();
    } else {
      value?.showModal();
    }
    this.open = !this.open;
  };

  readonly #handleOverviewOpen = (event: Event) => {
    const { mode } = (event as CustomEvent<OpenDocumentOverviewDetail>).detail;
    this._overviewMode = mode;
    if (!this.open) {
      this.#dialogRef.value?.showModal();
      this.open = true;
    }
  };

  readonly #focusNode = (event: Event) => {
    const { range } = (event as FocusNodeEvent).detail;

    if (this.open) {
      this.#dialogRef.value?.close();
      this.open = false;
    }

    if (!range) return;

    const selection = globalThis.getSelection();
    if (selection) {
      selection.collapse(range.startContainer, range.startOffset);
    }
  };

  readonly #focusValidationItem = async (event: CustomEventInit<{ range: Range; identifier: string }>) => {
    const { identifier, range } = event.detail || {};
    if (!range) return;

    if (!this.open && identifier === this.identifier) {
      this.#toggleOpen();
    }

    await this.updateComplete;

    const items = this.shadowRoot?.querySelectorAll('clippy-validation-item');
    const match = [...(items ?? [])].find((el) => (el as ValidationItem).range === range);
    if (match instanceof HTMLElement) {
      match.scrollIntoView({ behavior: 'smooth', block: 'center' });
      (match as ValidationItem).focus();
    }
  };

  readonly #handleTabChange = (event: CustomEventInit<{ severity: ValidationSeverity }>) => {
    this.selectedSeverity = event.detail?.severity || null;
  };

  #getFilteredValidations(): [Range, ValidationResult][] {
    const validations = [...(this.validationsContext?.entries() ?? [])];

    if (!this.selectedSeverity) {
      return validations;
    }

    return validations.filter(([, validation]) => validation.severity === this.selectedSeverity);
  }

  #setOverviewMode(mode: DocumentOverviewMode) {
    this._overviewMode = this._overviewMode === mode ? null : mode;
  }

  override render() {
    const { size = 0 } = this.validationsContext || {};
    const filteredValidations = this.#getFilteredValidations();
    const isOverview = this._overviewMode !== null;
    return html`
      <dialog
        ${ref(this.#dialogRef)}
        data-testid="clippy-validations-drawer"
        class="clippy-dialog__content"
        aria-label=${msg('Accessibility notifications')}
      >
        <div class="clippy-dialog__header">
          <clippy-button
            class="clippy-dialog__close-button"
            icon-only
            purpose="subtle"
            @click=${() => this.#toggleOpen()}
          >
            <clippy-icon slot="iconStart">${unsafeSVG(X)}</clippy-icon>
            ${msg('Close')}
          </clippy-button>
          <div class="clippy-dialog__overview-buttons">
            <clippy-button
              purpose="subtle"
              aria-pressed=${this._overviewMode === 'heading-structure'}
              @click=${() => this.#setOverviewMode('heading-structure')}
            >
              <clippy-icon slot="iconStart">${unsafeSVG(ListIcon)}</clippy-icon>
              ${msg('Heading structure')}
            </clippy-button>
            <clippy-button
              purpose="subtle"
              aria-pressed=${this._overviewMode === 'link-list'}
              @click=${() => this.#setOverviewMode('link-list')}
            >
              <clippy-icon slot="iconStart">${unsafeSVG(LinkIcon)}</clippy-icon>
              ${msg('Links')}
            </clippy-button>
            <clippy-button
              purpose="subtle"
              aria-pressed=${this._overviewMode === 'language-changes'}
              @click=${() => this.#setOverviewMode('language-changes')}
            >
              <clippy-icon slot="iconStart">${unsafeSVG(LanguageIcon)}</clippy-icon>
              ${msg('Language changes')}
            </clippy-button>
          </div>
          <clippy-tabs ?hidden=${isOverview}></clippy-tabs>
        </div>
        <div class="clippy-dialog__body">
          <div
            role="region"
            aria-label=${msg('Heading structure')}
            ?hidden=${this._overviewMode !== 'heading-structure'}
          >
            <clippy-heading-structure></clippy-heading-structure>
          </div>
          <div role="region" aria-label=${msg('Links')} ?hidden=${this._overviewMode !== 'link-list'}>
            <clippy-link-list></clippy-link-list>
          </div>
          <div role="region" aria-label=${msg('Language changes')} ?hidden=${this._overviewMode !== 'language-changes'}>
            <clippy-language-changes></clippy-language-changes>
          </div>
          <ul class="clippy-dialog__list" data-testid="clippy-validations-list" ?hidden=${isOverview}>
            ${size > 0
              ? map(filteredValidations, ([, { correct, range, severity, tipPayload, validatorKey }]) => {
                  const valKey = validatorKey as ValidationKey;
                  const { customCorrectLabel, description, href, tip } = validationMessages()[valKey];
                  const tipHtml = tip?.(tipPayload) ?? null;
                  return html`
                    <clippy-validation-item
                      .range=${range}
                      .severity=${severity}
                      .description=${description}
                      .href=${href}
                      .customCorrectLabel=${customCorrectLabel}
                      .correct=${correct}
                    >
                      ${tipHtml ? html`<p class="nl-paragraph" slot="tip-html">${tipHtml}</p>` : nothing}
                    </clippy-validation-item>
                  `;
                })
              : html`<li class="clippy-dialog__list-item">${msg('No accessibility notifications found.')}</li>`}
          </ul>
        </div>
      </dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'clippy-validations-dialog': ValidationsDialog;
  }
}
