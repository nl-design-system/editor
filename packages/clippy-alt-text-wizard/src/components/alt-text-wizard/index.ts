import { localized, msg } from '@lit/localize';
import headingStyle from '@nl-design-system-candidate/heading-css/heading.css?inline';
import paragraphStyle from '@nl-design-system-candidate/paragraph-css/paragraph.css?inline';
import { safeCustomElement } from '@nl-design-system-community/clippy-components/lib/decorators';
import ArrowBackIcon from '@tabler/icons/outline/arrow-back-up.svg?raw';
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
import { WizardMachineController } from '@/controllers/WizardMachineController.ts';
import { initializeLocale } from '@/localization.ts';
import { altTextWizardMachine } from '@/state-machine.ts';

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
    unsafeCSS(headingStyle),
    unsafeCSS(paragraphStyle),
    unsafeCSS(formFieldStyles),
    unsafeCSS(formFieldDescriptionStyles),
    unsafeCSS(formLabelStyles),
    unsafeCSS(radioButtonStyles),
    unsafeCSS(unorderedListStyles),
  ];

  private readonly wizard = new WizardMachineController(this, altTextWizardMachine);

  @state() private _pendingSelection: 'yes' | 'no' | null = null;

  override connectedCallback() {
    super.connectedCallback();
    initializeLocale().then(() => {
      this.requestUpdate();
    });
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

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
          <label class="utrecht-form-label" for="${groupName}-yes">${msg('Yes', { id: 'yes' })}</label>
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
          <label class="utrecht-form-label" for="${groupName}-no">${msg('No', { id: 'no' })}</label>
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
        ${msg('Back', { id: 'back-button' })}
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
        ${msg('Continue', { id: 'continue-button' })}
      </clippy-button>
    `;
  }

  #renderQuestion(questionId: string, questionText: unknown) {
    return html`
      ${this.#renderBackButton()}
      <div class="utrecht-form-field" role="radiogroup" aria-labelledby="${questionId}-label">
        <div class="utrecht-form-field__label">
          <label id="${questionId}-label" class="utrecht-form-label nl-heading nl-heading--level-3">
            ${questionText}
          </label>
        </div>
        ${this.#renderYesNoRadio(questionId)}
      </div>
      ${this.#renderContinueButton()}
    `;
  }

  // ── Step renders ─────────────────────────────────────────────────────────

  #renderResult(title: unknown, instructions: unknown) {
    return html`
      ${this.#renderBackButton()}
      <div class="clippy-wizard__result" role="status" aria-live="polite">
        <h3 class="nl-heading nl-heading--level-3">${title}</h3>
        <p class="nl-paragraph">${instructions}</p>
      </div>
    `;
  }

  // ── Result renderers ────────────────────────────────────────────────────

  #renderDecorativeResult() {
    return this.#renderResult(
      msg('Decorative image', { id: 'result-decorative-title' }),
      msg(
        'This image is decorative. Set the alt attribute to empty (alt=""). This way, screen readers will skip the image.',
        { id: 'result-decorative-instructions' },
      ),
    );
  }

  #renderClickableLogoResult() {
    return this.#renderResult(
      msg('Clickable logo', { id: 'result-clickable-logo-title' }),
      msg('Use the company or organization name as alt text. For example: alt="Organization Name - go to homepage".', {
        id: 'result-clickable-logo-instructions',
      }),
    );
  }

  #renderFunctionalWithoutTextResult() {
    return this.#renderResult(
      msg('Functional image without text', { id: 'result-functional-no-text-title' }),
      msg(
        'Describe the function of the image, not what it looks like. For example: alt="Search" for a magnifying glass icon used as a search button.',
        {
          id: 'result-functional-no-text-instructions',
        },
      ),
    );
  }

  #renderFunctionalWithSupplementaryTextResult() {
    return this.#renderResult(
      msg('Functional image with supplementary text', { id: 'result-functional-supplementary-text-title' }),
      msg(
        'The text next to the image already describes its function. Set the alt attribute to empty (alt="") to avoid repetition.',
        { id: 'result-functional-supplementary-text-instructions' },
      ),
    );
  }

  #renderFunctionalWithTextResult() {
    return this.#renderResult(
      msg('Functional image with text', { id: 'result-functional-with-text-title' }),
      msg('The image contains text that is not available elsewhere. Use the text from the image as alt text.', {
        id: 'result-functional-with-text-instructions',
      }),
    );
  }

  #renderLogoResult() {
    return this.#renderResult(
      msg('Logo', { id: 'result-logo-title' }),
      msg('Use the company or organization name as alt text. For example: alt="Organization Name".', {
        id: 'result-logo-instructions',
      }),
    );
  }

  #renderAmbientResult() {
    return this.#renderResult(
      msg('Ambient image', { id: 'result-ambient-title' }),
      msg(
        'This image sets the mood but does not contain unique information. Set the alt attribute to empty (alt="") or use a brief description that conveys the mood.',
        { id: 'result-ambient-instructions' },
      ),
    );
  }

  #renderSimpleInformativeResult() {
    return this.#renderResult(
      msg('Simple informative image', { id: 'result-simple-informative-title' }),
      msg('Describe the essential information from the image in the alt text. Keep it short: 1 to 2 sentences.', {
        id: 'result-simple-informative-instructions',
      }),
    );
  }

  #renderComplexInformativeResult() {
    return this.#renderResult(
      msg('Complex informative image', { id: 'result-complex-informative-title' }),
      msg(
        'Provide a short alt text as summary. Also provide a detailed description in the surrounding text or via a link to a full description.',
        { id: 'result-complex-informative-instructions' },
      ),
    );
  }

  // ── Main step dispatcher ─────────────────────────────────────────────────

  #renderCurrentStep() {
    const snapshot = this.wizard.snapshot;
    if (!snapshot) return nothing;

    const stateValue = snapshot.value as string;

    switch (stateValue) {
      case 'informationLost':
        return html`
          <div class="utrecht-form-field" role="radiogroup" aria-labelledby="informationLost-label">
            <div class="utrecht-form-field__label">
              <label id="informationLost-label" class="utrecht-form-label nl-heading nl-heading--level-3">
                ${msg('If I remove the image, will information be lost?', { id: 'question-information-lost' })}
              </label>
            </div>
            ${this.#renderYesNoRadio('informationLost')}
          </div>
          ${this.#renderContinueButton()}
        `;
      case 'isClickable':
        return this.#renderQuestion(
          'isClickable',
          msg('Is the image clickable (link, button)?', { id: 'question-is-clickable' }),
        );
      case 'isLogoClickable':
        return this.#renderQuestion(
          'isLogoClickable',
          msg('Is the image a logo?', { id: 'question-is-logo-clickable' }),
        );
      case 'containsText':
        return this.#renderQuestion(
          'containsText',
          msg('Does the image contain text?', { id: 'question-contains-text' }),
        );
      case 'canPlaceTextBeside':
        return this.#renderQuestion(
          'canPlaceTextBeside',
          msg('Can you also place the text in or next to the image?', { id: 'question-can-place-text-beside' }),
        );
      case 'isLogo':
        return this.#renderQuestion('isLogo', msg('Is it a logo?', { id: 'question-is-logo' }));
      case 'containsUniqueInfo':
        return this.#renderQuestion(
          'containsUniqueInfo',
          msg(
            'Does the image contain information that is not available as text on the page and is necessary to understand the content?',
            { id: 'question-contains-unique-info' },
          ),
        );
      case 'isInfoSimple':
        return this.#renderQuestion(
          'isInfoSimple',
          msg('Is the information short and simple (2-3 lines)?', { id: 'question-is-info-simple' }),
        );
      case 'decorativeResult':
        return this.#renderDecorativeResult();
      case 'clickableLogoResult':
        return this.#renderClickableLogoResult();
      case 'functionalWithoutTextResult':
        return this.#renderFunctionalWithoutTextResult();
      case 'functionalWithSupplementaryTextResult':
        return this.#renderFunctionalWithSupplementaryTextResult();
      case 'functionalWithTextResult':
        return this.#renderFunctionalWithTextResult();
      case 'logoResult':
        return this.#renderLogoResult();
      case 'ambientResult':
        return this.#renderAmbientResult();
      case 'simpleInformativeResult':
        return this.#renderSimpleInformativeResult();
      case 'complexInformativeResult':
        return this.#renderComplexInformativeResult();
      default:
        return nothing;
    }
  }

  // ── Main render ───────────────────────────────────────────────────────────

  override render() {
    return html`
      <div class="clippy-wizard">
        <h2 class="nl-heading nl-heading--level-2 clippy-wizard__title">
          ${msg('Choose the right alt text', { id: 'wizard-title' })}
        </h2>
        <form class="clippy-wizard__form" @submit=${(e: Event) => e.preventDefault()} novalidate>
          ${this.#renderCurrentStep()}
        </form>
      </div>
    `;
  }
}
