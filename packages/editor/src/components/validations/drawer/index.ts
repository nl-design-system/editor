import type { Editor } from '@tiptap/core';
import { consume } from '@lit/context';
import { localized, msg } from '@lit/localize';
import numberBadgeStyles from '@nl-design-system-candidate/number-badge-css/number-badge.css?inline';
import paragraphStyle from '@nl-design-system-candidate/paragraph-css/paragraph.css?inline';
import { safeCustomElement } from '@nl-design-system-community/clippy-components/lib/decorators';
import X from '@tabler/icons/outline/x.svg?raw';
import { html, LitElement, unsafeCSS } from 'lit';
import { property, state } from 'lit/decorators.js';
import '@/components/validations/list';
import '@/components/content-views/heading-structure';
import '@/components/content-views/link-list';
import '@/components/content-views/language-changes';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import type { ValidationItem } from '@/components/validations/validation-item';
import type { ValidationsMap, ValidationSeverity } from '@/types/validation';
import '@/components/validation-filters';
import '@nl-design-system-community/clippy-components/clippy-button';
import '@nl-design-system-community/clippy-components/clippy-icon';
import { identifierContext } from '@/context/identifierContext';
import { tiptapContext } from '@/context/tiptapContext';
import { validationsContext } from '@/context/validationsContext';
import {
  CustomEvents,
  type CorrectValidationIssueEvent,
  type DocumentOverviewMode,
  type FocusNodeEvent,
  type OpenDocumentOverviewDetail,
} from '@/events';
import drawerStyles from './styles';

const tag = 'clippy-validations-drawer';

/**
 * Inline drawer panel that lists all accessibility validation results and
 * provides document overview panels (heading structure, link list, language
 * changes). Opens and closes in response to the global
 * `CustomEvents.OPEN_VALIDATIONS_DIALOG` event, scoped to the current editor
 * identifier.
 *
 * @tag clippy-validations-drawer
 *
 * @fires {OpenValidationsDialogEvent} OPEN_VALIDATIONS_DIALOG - Listens for this event to
 *   toggle the panel open state.
 * @fires {CustomEvent} FILTER_CHANGE - Listens to filter the displayed validations
 *   by severity.
 *
 * @example
 * ```html
 * <clippy-validations-drawer></clippy-validations-drawer>
 * ```
 */
@localized()
@safeCustomElement(tag)
export class ValidationsDrawer extends LitElement {
  static override readonly styles = [drawerStyles, unsafeCSS(numberBadgeStyles), unsafeCSS(paragraphStyle)];
  @state()
  private open = false;

  @state()
  private selectedSeverity: ValidationSeverity | null = null;

  @state()
  private _mode: DocumentOverviewMode = 'validations';

  @consume({ context: identifierContext, subscribe: true })
  @property({ attribute: false })
  private readonly identifier?: string;

  @consume({ context: tiptapContext, subscribe: true })
  @property({ attribute: false })
  public editor?: Editor;

  @consume({ context: validationsContext, subscribe: true })
  @property({ attribute: false })
  validationsContext?: ValidationsMap;

  override connectedCallback() {
    super.connectedCallback();
    globalThis.addEventListener(CustomEvents.CORRECT_VALIDATION_ISSUE, this.#closeDialog);
    globalThis.addEventListener(CustomEvents.FILTER_CHANGE, this.#handleFilterChange);
    globalThis.addEventListener(CustomEvents.FOCUS_NODE, this.#focusNode);
    globalThis.addEventListener(CustomEvents.FOCUS_VALIDATION_ITEM_IN_DRAWER, this.#focusValidationItem);
    globalThis.addEventListener(CustomEvents.OPEN_DOCUMENT_OVERVIEW, this.#handleOverviewOpen);
  }

  override disconnectedCallback() {
    globalThis.removeEventListener(CustomEvents.CORRECT_VALIDATION_ISSUE, this.#closeDialog);
    globalThis.removeEventListener(CustomEvents.FILTER_CHANGE, this.#handleFilterChange);
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
      this.open = false;
    }
  };

  readonly #handleOverviewOpen = (event: Event) => {
    const { identifier, mode } = (event as CustomEvent<OpenDocumentOverviewDetail>).detail;
    if (identifier !== this.identifier) return;
    this._mode = mode;
    if (!this.open) {
      this.open = true;
    }
  };

  readonly #closeDrawer = () => {
    this.open = false;
  };

  // The drawer is an inline panel rather than a native dialog, so Escape-to-close
  // is handled explicitly to preserve keyboard dismissal.
  readonly #handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && this.open) {
      event.preventDefault();
      this.#closeDrawer();
    }
  };

  readonly #focusNode = (event: Event) => {
    const { range } = (event as FocusNodeEvent).detail;

    if (this.open) {
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
      this._mode = 'validations';
      this.open = true;
    }

    await this.updateComplete;

    const listEl = this.shadowRoot?.querySelector('clippy-validations-list');
    const items = listEl?.shadowRoot?.querySelectorAll('clippy-validation-item');
    const match = [...(items ?? [])].find((el) => (el as ValidationItem).range === range);
    if (match instanceof HTMLElement) {
      match.scrollIntoView({ behavior: 'smooth', block: 'center' });
      (match as ValidationItem).focus();
    }
  };

  readonly #handleFilterChange = (event: CustomEventInit<{ severity: ValidationSeverity }>) => {
    this.selectedSeverity = event.detail?.severity || null;
  };

  /** Title of the content currently shown in the drawer. */
  #getTitle(): string {
    switch (this._mode) {
      case 'heading-structure':
        return msg('Heading structure');
      case 'link-list':
        return msg('Links');
      case 'language-changes':
        return msg('Language changes');
      default:
        return msg('Errors, warnings or tips');
    }
  }

  override render() {
    const isOverview = this._mode !== 'validations';
    return html`
      <div
        data-testid="clippy-validations-drawer"
        class="clippy-drawer__content"
        role="region"
        aria-labelledby="clippy-drawer-title"
        ?hidden=${!this.open}
        @keydown=${this.#handleKeydown}
      >
        <div class="clippy-drawer__header">
          <h3 id="clippy-drawer-title" class="clippy-drawer__title">${this.#getTitle()}</h3>
          <clippy-button class="clippy-drawer__close-button" icon-only purpose="subtle" @click=${this.#closeDrawer}>
            <clippy-icon slot="iconStart">${unsafeSVG(X)}</clippy-icon>
            ${msg('Close')}
          </clippy-button>
        </div>
        <div class="clippy-drawer__filters">
          <clippy-validation-filters ?hidden=${isOverview}></clippy-validation-filters>
        </div>
        <div class="clippy-drawer__body">
          <div role="region" aria-label=${msg('Heading structure')} ?hidden=${this._mode !== 'heading-structure'}>
            <clippy-heading-structure></clippy-heading-structure>
          </div>
          <div role="region" aria-label=${msg('Links')} ?hidden=${this._mode !== 'link-list'}>
            <clippy-link-list></clippy-link-list>
          </div>
          <div role="region" aria-label=${msg('Language changes')} ?hidden=${this._mode !== 'language-changes'}>
            <clippy-language-changes></clippy-language-changes>
          </div>
          <div role="region" aria-label=${msg('Validations')} ?hidden=${this._mode !== 'validations'}>
            <clippy-validations-list .severity=${this.selectedSeverity}></clippy-validations-list>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'clippy-validations-drawer': ValidationsDrawer;
  }
}
