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
import {
  DecorativeCheck,
  ImageType,
  InformativeType,
  altTextWizardMachine,
  type AltTextWizardContext,
} from '@/state-machine.ts';

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

  @state() private _pendingSelection: string | null = null;

  override connectedCallback() {
    super.connectedCallback();
    initializeLocale().then(() => {
      this.requestUpdate();
    });
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  #handleContinue() {
    if (!this._pendingSelection) return;
    const stateValue = this.wizard.snapshot?.value as string;

    switch (stateValue) {
      case 'imageType':
        this.wizard.send({ type: 'SELECT_IMAGE_TYPE', value: this._pendingSelection as ImageType });
        break;
      case 'decorativeCheck':
        this.wizard.send({
          type: 'SELECT_DECORATIVE_CHECK',
          value: this._pendingSelection as DecorativeCheck,
        });
        break;
      case 'informativeType':
        this.wizard.send({
          type: 'SELECT_INFORMATIVE_TYPE',
          value: this._pendingSelection as InformativeType,
        });
        break;
    }

    this._pendingSelection = null;
  }

  #renderRadioOption(groupName: string, value: string, label: string, description: string | null) {
    const id = `${groupName}-${value}`;
    return html`
      <div class="utrecht-form-field utrecht-form-field--radio">
        <div class="utrecht-form-field__input">
          <input
            class="utrecht-radio-button utrecht-radio-button--html-input"
            type="radio"
            id=${id}
            name=${groupName}
            value=${value}
            @change=${() => {
              this._pendingSelection = value;
            }}
          />
        </div>
        <div class="utrecht-form-field__label">
          <label class="utrecht-form-label" for=${id}>${label}</label>
          ${description ? html`<p class="utrecht-form-field-description">${description}</p>` : nothing}
        </div>
      </div>
    `;
  }

  #renderBackButton() {
    return html`
      <clippy-button purpose="subtle" type="button" @click=${() => this.wizard.send({ type: 'BACK' })}>
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

  // ── Step renders ─────────────────────────────────────────────────────────

  #renderImageTypeQuestion() {
    const options: Array<{ label: string; value: ImageType }> = [
      { label: msg('Decorative', { id: 'image-type-decorative' }), value: ImageType.Decorative },
      { label: msg('Informative', { id: 'image-type-informative' }), value: ImageType.Informative },
      { label: msg('Functional (clickable)', { id: 'image-type-functional' }), value: ImageType.Functional },
      { label: msg('Logo', { id: 'image-type-logo' }), value: ImageType.Logo },
      { label: msg('Image of text (screenshot)', { id: 'image-type-text' }), value: ImageType.ImageOfText },
    ];

    return html`
      <p class="nl-paragraph">
        ${msg('Answer a few short questions about your image. You will immediately get advice about:', {
          id: 'wizard-intro',
        })}
      </p>
      <ul class="utrecht-unordered-list">
        <li class="utrecht-unordered-list__item">
          ${msg('Whether alt text is needed.', { id: 'wizard-intro-item-1' })}
        </li>
        <li class="utrecht-unordered-list__item">${msg('What to write.', { id: 'wizard-intro-item-2' })}</li>
      </ul>
      <p class="nl-paragraph">
        ${msg(
          'This way you ensure everyone can understand your content, including with assistive technology such as a screen reader.',
          { id: 'wizard-intro-outro' },
        )}
      </p>
      <div class="utrecht-form-field" role="radiogroup" aria-labelledby="image-type-label">
        <div class="utrecht-form-field__label">
          <label id="image-type-label" class="utrecht-form-label nl-heading nl-heading--level-3">
            ${msg('What type of image is it?', { id: 'question-image-type' })}
          </label>
        </div>
        ${options.map((opt) => this.#renderRadioOption('imageType', opt.value, opt.label, null))}
      </div>
      ${this.#renderContinueButton()}
    `;
  }

  #renderDecorativeCheckQuestion() {
    const options: Array<{ label: string; value: DecorativeCheck }> = [
      { label: msg('Yes', { id: 'yes' }), value: DecorativeCheck.Yes },
      { label: msg('No', { id: 'no' }), value: DecorativeCheck.No },
    ];

    return html`
      ${this.#renderBackButton()}
      <div class="utrecht-form-field" role="radiogroup" aria-labelledby="decorative-check-label">
        <div class="utrecht-form-field__label">
          <label id="decorative-check-label" class="utrecht-form-label nl-heading nl-heading--level-3">
            ${msg('If I remove the image, will information be lost?', { id: 'question-decoratief-check' })}
          </label>
        </div>
        ${options.map((opt) => this.#renderRadioOption('decorativeCheck', opt.value, opt.label, null))}
      </div>
      ${this.#renderContinueButton()}
    `;
  }

  #renderInformativeTypeQuestion() {
    const options: Array<{ description: string; label: string; value: InformativeType }> = [
      {
        description: msg(
          'The image contains information that is not available as text on the page and is necessary to understand the content. For example: chart, diagram, step-by-step guide, important photo.',
          { id: 'informatief-type-informative-description' },
        ),
        label: msg('Informative', { id: 'informatief-type-informative' }),
        value: InformativeType.Informative,
      },
      {
        description: '',
        label: msg('Clickable without text', { id: 'informatief-type-clickable-no-text' }),
        value: InformativeType.ClickableWithoutText,
      },
      {
        description: '',
        label: msg('Clickable with text', { id: 'informatief-type-clickable-with-text' }),
        value: InformativeType.ClickableWithText,
      },
      {
        description: '',
        label: msg('Decorative after all', { id: 'informatief-type-decorative-after-all' }),
        value: InformativeType.DecorativeAfterAll,
      },
    ];

    return html`
      ${this.#renderBackButton()}
      <div class="utrecht-form-field" role="radiogroup" aria-labelledby="informative-type-label">
        <div class="utrecht-form-field__label">
          <label id="informative-type-label" class="utrecht-form-label nl-heading nl-heading--level-3">
            ${msg('What type of informative image is this?', { id: 'question-informatief-type' })}
          </label>
        </div>
        ${options.map((opt) =>
          this.#renderRadioOption('informativeType', opt.value, opt.label, opt.description || null),
        )}
      </div>
      ${this.#renderContinueButton()}
    `;
  }

  #renderResult(context: AltTextWizardContext) {
    return html`
      ${this.#renderBackButton()}
      <div class="clippy-wizard__result" role="status" aria-live="polite">
        <p class="nl-paragraph">
          <strong>${msg('Answers:', { id: 'result-answers' })}</strong>
        </p>
        <ul class="utrecht-unordered-list">
          ${context.imageType
            ? html`<li class="utrecht-unordered-list__item">
                ${msg('Type of image:', { id: 'result-image-type' })} <strong>${context.imageType}</strong>
              </li>`
            : nothing}
          ${context.decorativeCheck
            ? html`<li class="utrecht-unordered-list__item">
                ${msg('Information lost when removed:', { id: 'result-decoratief-check' })}
                <strong>${context.decorativeCheck}</strong>
              </li>`
            : nothing}
          ${context.informativeType
            ? html`<li class="utrecht-unordered-list__item">
                ${msg('Type of informative image:', { id: 'result-informatief-type' })}
                <strong>${context.informativeType}</strong>
              </li>`
            : nothing}
        </ul>
      </div>
    `;
  }

  #renderCurrentStep() {
    const snapshot = this.wizard.snapshot;
    if (!snapshot) return nothing;

    const stateValue = snapshot.value as string;
    const context = snapshot.context as AltTextWizardContext;

    switch (stateValue) {
      case 'imageType':
        return this.#renderImageTypeQuestion();
      case 'decorativeCheck':
        return this.#renderDecorativeCheckQuestion();
      case 'informativeType':
        return this.#renderInformativeTypeQuestion();
      case 'result':
        return this.#renderResult(context);
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
