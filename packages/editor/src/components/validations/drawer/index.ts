import type { Editor } from '@tiptap/core';
import { consume } from '@lit/context';
import numberBadgeStyles from '@nl-design-system-candidate/number-badge-css/number-badge.css?inline';
import X from '@tabler/icons/outline/x.svg?raw';
import { html, LitElement, nothing, unsafeCSS } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { queryAll } from 'lit/decorators/query-all.js';
import { map } from 'lit/directives/map.js';
import { createRef, ref, type Ref } from 'lit/directives/ref.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import type { ValidationEntry, ValidationsMap, ValidationSeverity } from '@/types/validation.ts';
import './validation-list-item';
import { type ValidationKey, validationMessages } from '@/components/validations/messages.ts';
import { tiptapContext } from '@/context/tiptapContext.ts';
import { validationsContext } from '@/context/validationsContext.ts';
import '@/components/tabs';
import { CustomEvents } from '@/events';
import dialogStyles from './styles.ts';

const sortByPos = (a: ValidationEntry, b: ValidationEntry) => a[1].pos - b[1].pos;

@customElement('clippy-validations-dialog')
export class ValidationsDialog extends LitElement {
  static override readonly styles = [dialogStyles, unsafeCSS(numberBadgeStyles)];
  @state()
  private open = false;

  @state()
  private selectedSeverity: ValidationSeverity | null = null;

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
    globalThis.addEventListener(CustomEvents.TAB_CHANGE, this.#handleTabChange);
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

  readonly #handleTabChange = (event: CustomEvent<{ severity: ValidationSeverity | null }>) => {
    this.selectedSeverity = event.detail.severity;
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
        aria-label="Toegankelijkheidsfouten"
      >
        <button class="clippy-dialog__close-button" @click=${() => this.#toggleOpen()}>${unsafeSVG(X)}</button>
        <clippy-tabs></clippy-tabs>
        <ul class="clippy-dialog__list" data-testid="clippy-validations-list">
          ${size > 0
            ? map(filteredValidations, ([key, { pos, severity, tipPayload }]) => {
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
