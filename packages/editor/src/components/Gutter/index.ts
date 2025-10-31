import type { Editor } from '@tiptap/core';
import { consume } from '@lit/context';
import numberBadgeStyles from '@nl-design-system-candidate/number-badge-css/number-badge.css?inline';
import AccessibleIcon from '@tabler/icons/outline/accessible.svg?raw';
import CloseIcon from '@tabler/icons/outline/x.svg?raw';
import { html, LitElement, unsafeCSS } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import { createRef, ref, type Ref } from 'lit/directives/ref.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import { tiptapContext } from '@/context/tiptapContext.ts';
import { type ValidationMeta, validationsContext, type ValidationsMap } from '@/context/validationsContext.ts';
import gutterStyles from './styles.ts';

@customElement('clippy-gutter')
export class Gutter extends LitElement {
  static override readonly styles = [gutterStyles, unsafeCSS(numberBadgeStyles)];
  @state()
  private isOpen = false;

  @consume({ context: tiptapContext })
  @property({ attribute: false })
  public editor?: Editor;

  @consume({ context: validationsContext, subscribe: true })
  @property({ attribute: false })
  validationsContext?: ValidationsMap;

  private dialogRef: Ref<HTMLDialogElement> = createRef();

  #toggleOpen = () => {
    const { value } = this.dialogRef;
    if (this.isOpen) {
      value?.close();
    } else {
      value?.show();
    }
    this.isOpen = !this.isOpen;
  };

  #focusNode(item: ValidationMeta) {
    try {
      const { view } = this.editor || {};
      const nodeDom = view?.nodeDOM?.(item.pos) ?? view?.domAtPos(item.pos).node;
      if (nodeDom instanceof HTMLElement) {
        nodeDom.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      // Set a text selection at the position and focus the view
      this.editor?.commands.focus(item.pos);
      this.#toggleOpen();
    } catch (err) {
      console.error('Cannot scroll to and focus node', err);
    }
  }

  renderValidationContent() {
    const { size = 0 } = this.validationsContext || {};
    return html`<ul class="clippy-dialog__list">
      ${size > 0
        ? map(
            this.validationsContext?.entries(),
            (item) =>
              html` <li class="clippy-dialog__list-item" xmlns="http://www.w3.org/1999/html" tabindex="0">
                <div class="clippy-dialog__list-item-quote">"<i>${item[0]}</i>"</div>
                <div class="clippy-dialog__list-item-message">${item[1].severity}</div>
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
                  <utrecht-button appearance="secondary-action-button" @click=${() => this.#focusNode(item[1])}
                    >Aanpassen</utrecht-button
                  >
                </div>
              </li>`,
          )
        : html`<li class="clippy-dialog__list-item">Geen toegankelijkheidsfouten gevonden.</li>`}
    </ul>`;
  }

  override render() {
    const { size = 0 } = this.validationsContext || {};
    return html`
      <ol class="clippy-gutter-list" role="list">
        ${map(
          this.validationsContext?.values(),
          ({ id, domRect }) =>
            domRect &&
            html`<li
              class="clippy-gutter-item"
              style="inset-block-start: ${domRect.top}px; block-size: ${domRect.height}px"
              title=${id}
            ></li>`,
        )}
      </ol>
      <button
        class="clippy-dialog-toggle"
        @click=${this.#toggleOpen}
        aria-expanded=${this.isOpen}
        aria-controls="dialog-content"
      >
        <span class="clippy-screen-reader-text">Toon toegankelijkheidsfouten</span>
        ${this.isOpen ? unsafeSVG(CloseIcon) : unsafeSVG(AccessibleIcon)}
        ${size > 0
          ? html`<data value=${size} class="nl-number-badge nl-number-badge--clippy">
              <span hidden aria-hidden="true" class="nl-number-badge__visible-label">${size}</span>
              <span class="nl-number-badge__hidden-label">${size} toegankelijkheidsmeldingen</span>
            </data>`
          : null}
      </button>
      <div class="clippy-screen-reader-text" aria-live=${size > 0 ? 'polite' : 'off'}>
        Totaal ${size} gevonden toegankelijkheidsfouten.
      </div>
      <dialog
        ${ref(this.dialogRef)}
        id="dialog-content"
        class="clippy-dialog__content"
        aria-label="Toegankelijkheidsfouten"
      >
        ${this.renderValidationContent()}
      </dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'clippy-gutter': Gutter;
  }
}
