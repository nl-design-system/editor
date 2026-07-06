import type { Editor } from '@tiptap/core';
import { consume } from '@lit/context';
import { localized, msg } from '@lit/localize';
import numberBadgeStyles from '@nl-design-system-candidate/number-badge-css/number-badge.css?inline';
import paragraphStyle from '@nl-design-system-candidate/paragraph-css/paragraph.css?inline';
import { safeCustomElement } from '@nl-design-system-community/clippy-components/lib/decorators';
import X from '@tabler/icons/outline/x.svg?raw';
import { html, LitElement, unsafeCSS } from 'lit';
import { property, state } from 'lit/decorators.js';
import { createRef, ref, type Ref } from 'lit/directives/ref.js';
import '../list';
import '../../content-views/heading-structure';
import '../../content-views/link-list';
import '../../content-views/language-changes';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import type { ValidationsMap, ValidationSeverity } from '@/types/validation.ts';
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
} from '@/events';
import type { ValidationItem } from '../validation-item';
import drawerStyles from './styles.ts';

const tag = 'clippy-validations-drawer';

/**
 * Slide-in drawer dialog that lists all accessibility validation results and
 * provides document overview panels (heading structure, link list, language
 * changes). Opens and closes in response to the global
 * `CustomEvents.OPEN_VALIDATIONS_DIALOG` event, scoped to the current editor
 * identifier.
 *
 * @tag clippy-validations-drawer
 *
 * @fires {OpenValidationsDialogEvent} OPEN_VALIDATIONS_DIALOG - Listens for this event to
 *   toggle the dialog open state.
 * @fires {CustomEvent} TAB_CHANGE - Listens to filter the displayed validations
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

  readonly #dialogRef: Ref<HTMLDialogElement> = createRef();

  override connectedCallback() {
    super.connectedCallback();
    globalThis.addEventListener(CustomEvents.CORRECT_VALIDATION_ISSUE, this.#closeDialog);
    globalThis.addEventListener(CustomEvents.TAB_CHANGE, this.#handleTabChange);
    globalThis.addEventListener(CustomEvents.FOCUS_NODE, this.#focusNode);
    globalThis.addEventListener(CustomEvents.FOCUS_VALIDATION_ITEM_IN_DRAWER, this.#focusValidationItem);
    globalThis.addEventListener(CustomEvents.OPEN_DOCUMENT_OVERVIEW, this.#handleOverviewOpen);
  }

  override disconnectedCallback() {
    globalThis.removeEventListener(CustomEvents.CORRECT_VALIDATION_ISSUE, this.#closeDialog);
    globalThis.removeEventListener(CustomEvents.TAB_CHANGE, this.#handleTabChange);
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

  readonly #handleOverviewOpen = (event: Event) => {
    const { mode } = (event as CustomEvent<OpenDocumentOverviewDetail>).detail;
    this._mode = mode;
    if (!this.open) {
      this.#dialogRef.value?.showModal();
      this.open = true;
    }
  };

  readonly #closeDrawer = () => {
    this.#dialogRef.value?.close();
    this.open = false;
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
      this._mode = 'validations';
      this.#dialogRef.value?.showModal();
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

  readonly #handleTabChange = (event: CustomEventInit<{ severity: ValidationSeverity }>) => {
    this.selectedSeverity = event.detail?.severity || null;
  };

  override render() {
    const isOverview = this._mode !== 'validations';
    return html`
      <dialog
        ${ref(this.#dialogRef)}
        data-testid="clippy-validations-drawer"
        class="clippy-drawer__content"
        aria-label=${msg('Accessibility notifications')}
      >
        <div class="clippy-drawer__header">
          <clippy-button class="clippy-drawer__close-button" icon-only purpose="subtle" @click=${this.#closeDrawer}>
            <clippy-icon slot="iconStart">${unsafeSVG(X)}</clippy-icon>
            ${msg('Close')}
          </clippy-button>
          <clippy-tabs ?hidden=${isOverview}></clippy-tabs>
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
      </dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'clippy-validations-drawer': ValidationsDrawer;
  }
}
