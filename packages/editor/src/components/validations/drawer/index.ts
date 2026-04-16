import type { Editor } from '@tiptap/core';
import { consume } from '@lit/context';
import { localized, msg } from '@lit/localize';
import numberBadgeStyles from '@nl-design-system-candidate/number-badge-css/number-badge.css?inline';
import paragraphStyle from '@nl-design-system-candidate/paragraph-css/paragraph.css?inline';
import X from '@tabler/icons/outline/x.svg?raw';
import { html, LitElement, nothing, unsafeCSS } from 'lit';
import { property, state } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import { createRef, ref, type Ref } from 'lit/directives/ref.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import '../validation-item';
import type { ValidationEntry, ValidationsMap, ValidationSeverity } from '@/types/validation.ts';
import { identifierContext } from '@/context/identifierContext.ts';
import { tiptapContext } from '@/context/tiptapContext.ts';
import '@/components/tabs';
import '@nl-design-system-community/clippy-components/clippy-button';
import '@nl-design-system-community/clippy-components/clippy-icon';
import { validationsContext } from '@/context/validationsContext.ts';
import { safeCustomElement } from '@/decorators/SafeCustomElementDecorator.ts';
import { CustomEvents } from '@/events';
import { validationMessages, type ValidationKey } from '@/messages';
import type { ValidationItem } from '../validation-item';
import dialogStyles from './styles.ts';

const sortByPos = (a: ValidationEntry, b: ValidationEntry) => a[1].pos - b[1].pos;

@localized()
@safeCustomElement('clippy-validations-dialog')
export class ValidationsDialog extends LitElement {
  static override readonly styles = [dialogStyles, unsafeCSS(numberBadgeStyles), unsafeCSS(paragraphStyle)];
  @state()
  private open = false;

  @state()
  private selectedSeverity: ValidationSeverity | null = null;

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
  }

  override disconnectedCallback() {
    globalThis.removeEventListener(CustomEvents.CORRECT_VALIDATION_ISSUE, this.#closeDialog);
    globalThis.removeEventListener(CustomEvents.OPEN_VALIDATIONS_DIALOG, this.#toggleOpen);
    globalThis.removeEventListener(CustomEvents.FOCUS_NODE, this.#focusNode);
    globalThis.removeEventListener(CustomEvents.FOCUS_VALIDATION_ITEM_IN_DRAWER, this.#focusValidationItem);
    super.disconnectedCallback();
  }

  readonly #closeDialog = (event: Event) => {
    if (event instanceof CustomEvent) {
      const eventIdentifier = (event as CustomEvent<{ identifier?: string }>).detail?.identifier;
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
      const eventIdentifier = (event as CustomEvent<{ identifier?: string }>).detail?.identifier;
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

  readonly #focusNode = (event: CustomEventInit<{ pos: number }>) => {
    const { pos = 0 } = event.detail || {};

    if (this.open) {
      this.#dialogRef.value?.close();
      this.open = false;
    }
    // Set a text selection inside the node content (pos + 1 moves past the node's opening
    // token) so that isNodeActive correctly identifies the active format in toolbar-format-select.
    this.editor?.commands.focus(pos + 1, { scrollIntoView: true });
  };

  readonly #focusValidationItem = async (event: CustomEventInit<{ key: string; identifier: string }>) => {
    const { identifier, key } = event.detail || {};
    if (!key) return;

    if (!this.open && identifier === this.identifier) {
      this.#toggleOpen();
    }

    await this.updateComplete;

    const items = this.shadowRoot?.querySelectorAll('clippy-validation-item');
    const match = [...(items ?? [])].find((el) => (el as ValidationItem).key === key);
    if (match instanceof HTMLElement) {
      match.scrollIntoView({ behavior: 'smooth', block: 'center' });
      match.shadowRoot?.querySelector<HTMLElement>('[data-validation-key]')?.focus();
    }
  };

  readonly #handleTabChange = (event: CustomEventInit<{ severity: ValidationSeverity }>) => {
    this.selectedSeverity = event.detail?.severity || null;
  };

  #getFilteredValidations(): ValidationEntry[] {
    const validations = [...(this.validationsContext?.entries() ?? [])];

    if (!this.selectedSeverity) {
      return validations.sort(sortByPos);
    }

    return validations.filter(([, validation]) => validation.severity === this.selectedSeverity).sort(sortByPos);
  }

  override render() {
    const { size = 0 } = this.validationsContext || {};
    const filteredValidations = this.#getFilteredValidations();
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
          <clippy-tabs></clippy-tabs>
        </div>
        <div class="clippy-dialog__body">
          <ul class="clippy-dialog__list" data-testid="clippy-validations-list">
            ${size > 0
              ? map(filteredValidations, ([key, { correct, pos, severity, tipPayload }]) => {
                  const validationKey = key.split('_')[0] as ValidationKey;
                  const { customCorrectLabel, description, href, tip } = validationMessages()[validationKey];
                  const tipHtml = tip?.(tipPayload) ?? null;
                  return html`
                    <clippy-validation-item
                      .key=${key}
                      .pos=${pos}
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
