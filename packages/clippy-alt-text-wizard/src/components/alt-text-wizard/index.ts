import { localized, msg } from '@lit/localize';
import codeBlockStyle from '@nl-design-system-candidate/code-block-css/code-block.css?inline';
import codeStyle from '@nl-design-system-candidate/code-css/code.css?inline';
import headingStyle from '@nl-design-system-candidate/heading-css/heading.css?inline';
import linkStyle from '@nl-design-system-candidate/link-css/link.css?inline';
import paragraphStyle from '@nl-design-system-candidate/paragraph-css/paragraph.css?inline';
import { safeCustomElement } from '@nl-design-system-community/clippy-components/lib/decorators';
import ArrowBackIcon from '@tabler/icons/outline/arrow-back-up.svg?raw';
import RefreshIcon from '@tabler/icons/outline/refresh.svg?raw';
import formFieldStyles from '@utrecht/form-field-css/dist/index.css?inline';
import formFieldDescriptionStyles from '@utrecht/form-field-description-css/dist/index.css?inline';
import formLabelStyles from '@utrecht/form-label-css/dist/index.css?inline';
import radioButtonStyles from '@utrecht/radio-button-css/dist/index.css?inline';
import unorderedListStyles from '@utrecht/unordered-list-css/dist/index.css?inline';
import { LitElement, html, nothing, unsafeCSS } from 'lit';
import { state } from 'lit/decorators.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import '@nl-design-system-community/clippy-components/clippy-button';
import '@nl-design-system-community/clippy-components/clippy-icon';
import { AltTextStateMachineController } from '@/controllers/AltTextStateMachineController.ts';
import { initializeLocale } from '@/localization.ts';
import { type AltTextWizardState, altTextWizardMachine } from '@/state-machine.ts';
import { getQuestionContent } from './question-content.ts';
import { getResultContent } from './result-content.ts';

const tag = 'clippy-alt-text-wizard';

declare global {
  interface HTMLElementTagNameMap {
    [tag]: ClippyAltTextWizard;
  }
}

/**
 * @summary Guides authors through writing accessible alt text for images.
 * @tag clippy-alt-text-wizard
 */
@localized()
@safeCustomElement(tag)
export class ClippyAltTextWizard extends LitElement {
  static override readonly styles = [
    unsafeCSS(codeBlockStyle),
    unsafeCSS(codeStyle),
    unsafeCSS(headingStyle),
    unsafeCSS(linkStyle),
    unsafeCSS(paragraphStyle),
    unsafeCSS(formFieldStyles),
    unsafeCSS(formFieldDescriptionStyles),
    unsafeCSS(formLabelStyles),
    unsafeCSS(radioButtonStyles),
    unsafeCSS(unorderedListStyles),
  ];

  private readonly wizard = new AltTextStateMachineController(this, altTextWizardMachine);

  @state() private _pendingSelection: 'yes' | 'no' | null = null;

  override connectedCallback() {
    super.connectedCallback();
    initializeLocale().then(() => {
      this.requestUpdate();
    });
  }

  #handleContinue() {
    if (!this._pendingSelection) return;

    if (this._pendingSelection === 'yes') {
      this.wizard.send({ type: 'ANSWER_YES' });
    } else {
      this.wizard.send({ type: 'ANSWER_NO' });
    }

    this._pendingSelection = null;
  }

  #renderYesNoRadio(groupName: string) {
    return html`
      <div class="utrecht-form-field utrecht-form-field--radio">
        <div class="utrecht-form-field__input">
          <input
            class="utrecht-radio-button utrecht-radio-button--html-input"
            type="radio"
            id="${groupName}-yes"
            name=${groupName}
            value="yes"
            .checked=${this._pendingSelection === 'yes'}
            @change=${() => {
              this._pendingSelection = 'yes';
            }}
          />
        </div>
        <div class="utrecht-form-field__label">
          <label class="utrecht-form-label" for="${groupName}-yes">${msg('Yes')}</label>
        </div>
      </div>
      <div class="utrecht-form-field utrecht-form-field--radio">
        <div class="utrecht-form-field__input">
          <input
            class="utrecht-radio-button utrecht-radio-button--html-input"
            type="radio"
            id="${groupName}-no"
            name=${groupName}
            value="no"
            .checked=${this._pendingSelection === 'no'}
            @change=${() => {
              this._pendingSelection = 'no';
            }}
          />
        </div>
        <div class="utrecht-form-field__label">
          <label class="utrecht-form-label" for="${groupName}-no">${msg('No')}</label>
        </div>
      </div>
    `;
  }

  #renderBackButton() {
    return html`
      <clippy-button
        purpose="subtle"
        type="button"
        @click=${() => {
          this._pendingSelection = null;
          this.wizard.send({ type: 'BACK' });
        }}
      >
        <clippy-icon slot="iconStart">${unsafeSVG(ArrowBackIcon)}</clippy-icon>
        ${msg('Back')}
      </clippy-button>
    `;
  }

  #renderContinueButton() {
    return html`
      <clippy-button
        purpose="primary"
        type="button"
        ?disabled=${!this._pendingSelection}
        @click=${this.#handleContinue}
      >
        ${msg('Next step')}
      </clippy-button>
    `;
  }

  #renderQuestion(questionId: string, questionText: unknown, showBack: boolean, sectionTitle?: unknown) {
    return html`
      ${showBack ? this.#renderBackButton() : nothing}
      ${sectionTitle ? html`<h3 class="nl-heading nl-heading--level-3">${sectionTitle}</h3>` : nothing}
      <div class="utrecht-form-field" role="radiogroup" aria-labelledby="${questionId}-label">
        <div class="utrecht-form-field__label">
          <label
            id="${questionId}-label"
            class="utrecht-form-label${sectionTitle ? '' : ' nl-heading nl-heading--level-3'}"
          >
            ${questionText}
          </label>
        </div>
        ${this.#renderYesNoRadio(questionId)}
      </div>
      ${this.#renderContinueButton()}
    `;
  }

  #renderStartOverButton() {
    return html`
      <clippy-button
        purpose="subtle"
        type="button"
        @click=${() => {
          this._pendingSelection = null;
          this.wizard.restart();
        }}
      >
        <clippy-icon slot="iconStart">${unsafeSVG(RefreshIcon)}</clippy-icon>
        ${msg('Start over')}
      </clippy-button>
    `;
  }

  #renderResult(title: unknown, instructions: unknown, documentationUrl: string) {
    return html`
      ${this.#renderBackButton()}
      <div class="clippy-wizard__result" role="status" aria-live="polite">
        <h3 class="nl-heading nl-heading--level-3">${title}</h3>
        ${instructions}
        <p class="nl-paragraph">
          <a class="nl-link" href=${documentationUrl} target="_blank" rel="noreferrer">
            ${msg('Read more on nldesignsystem.nl')}
          </a>
        </p>
      </div>
      ${this.#renderStartOverButton()}
    `;
  }

  #renderCurrentStep() {
    const snapshot = this.wizard.snapshot;
    if (!snapshot) return nothing;

    const stateValue = snapshot.value as AltTextWizardState;

    const question = getQuestionContent().get(stateValue);
    if (question) {
      return this.#renderQuestion(question.questionId, question.questionText, question.showBack, question.sectionTitle);
    }

    const resultContent = getResultContent().get(stateValue);
    if (resultContent) {
      return this.#renderResult(resultContent.title, resultContent.instructions, resultContent.documentationUrl);
    }

    return nothing;
  }

  override render() {
    return html`
      <div class="clippy-wizard">
        <h2 class="nl-heading nl-heading--level-2 clippy-wizard__title">${msg('Alt text wizard')}</h2>
        <form class="clippy-wizard__form" @submit=${(e: Event) => e.preventDefault()} novalidate>
          ${this.#renderCurrentStep()}
        </form>
      </div>
    `;
  }
}
