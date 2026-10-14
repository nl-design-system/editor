import type { ValidationSeverity, ViolationCorrection } from '@nl-design-system-community/clippy-a11y-validator';
import type { ClippyButton } from '@nl-design-system-community/clippy-components/clippy-button';
import { consume } from '@lit/context';
import { localized, msg } from '@lit/localize';
import codeStyle from '@nl-design-system-candidate/code-css/code.css?inline';
import headingStyle from '@nl-design-system-candidate/heading-css/heading.css?inline';
import linkCss from '@nl-design-system-candidate/link-css/link.css?inline';
import paragraphStyle from '@nl-design-system-candidate/paragraph-css/paragraph.css?inline';
import { safeCustomElement } from '@nl-design-system-community/clippy-components/lib/decorators';
import AlertCircleIcon from '@tabler/icons/outline/alert-circle.svg?raw';
import AlertTriangleIcon from '@tabler/icons/outline/alert-triangle.svg?raw';
import ArrowLeftIcon from '@tabler/icons/outline/arrow-left.svg?raw';
import ExternalLinkIcon from '@tabler/icons/outline/external-link.svg?raw';
import InfoCircleIcon from '@tabler/icons/outline/info-circle.svg?raw';
import { LitElement, html, nothing, unsafeCSS, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { createRef, ref, type Ref } from 'lit/directives/ref.js';
import '@nl-design-system-community/clippy-components/clippy-button';
import '@nl-design-system-community/clippy-components/clippy-icon';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import type { ValidationInteractionMode } from '@/types/validation';
import { validationInteractionMode } from '@/constants';
import { identifierContext } from '@/context/identifierContext';
import { CustomEvents, type CorrectValidationIssueDetail, type FocusNodeDetail } from '@/events';
import validationListItemStyles from './styles';

const tag = 'clippy-validation-item';

declare global {
  interface HTMLElementTagNameMap {
    [tag]: ValidationItem;
  }
}

const ariaDescribedBy = 'validation-item-header';

type ValidationItemView = 'explanation' | 'solution';

/**
 * A single accessibility violation card. Displays the severity icon,
 * heading, explanation or solution, and action buttons (Focus, Correct).
 * The `mode` property controls which actions are visible.
 *
 * @tag clippy-validation-item
 *
 * @slot solution-html - Optional HTML content rendered as guidance below
 *   the heading, in place of the `explanation` property. Wrap content in a `<p>` element.
 *
 * @fires {CustomEvent<FocusNodeDetail>} FOCUS_NODE - Dispatched when the user clicks "Focus",
 *   carrying `detail.range` so the editor can scroll to the relevant node.
 * @fires {CustomEvent<CorrectValidationIssueDetail>} CORRECT_VALIDATION_ISSUE - Dispatched when the user
 *   clicks "Correct", triggering the auto-fix callback.
 *
 * @example
 * ```html
 * <clippy-validation-item
 *   severity="error"
 *   heading="Missing alt text on image"
 *   href="https://wcag.nl/…"
 * ></clippy-validation-item>
 * ```
 */
@localized()
@safeCustomElement(tag)
export class ValidationItem extends LitElement {
  static override readonly styles = [
    validationListItemStyles,
    unsafeCSS(paragraphStyle),
    unsafeCSS(headingStyle),
    unsafeCSS(linkCss),
    // The explanation and solution are HTML: a code element in them carries `nl-code`.
    unsafeCSS(codeStyle),
  ];

  /**
   * Display context for the item's action buttons.
   * - `list` (default) / `drawer` – Focus and Correct buttons.
   * - `readonly` – no action buttons rendered.
   */
  @property({ type: String }) mode: ValidationInteractionMode = validationInteractionMode.LIST;
  /** The DOM `Range` that this validation issue relates to. */
  @property({ attribute: false }) range?: Range;
  /** Severity level of the validation issue. */
  @property({ type: String }) severity!: ValidationSeverity;
  /** Human-readable heading of the validation issue. */
  @property({ type: String }) heading!: string;
  /** Optional URL linking to a more extensive explanation of the WCAG criterion. */
  @property({ type: String }) href?: string;
  /** What is wrong with the content, as HTML. Ignored when the `solution-html` slot is filled. */
  @property({ type: String }) explanation?: string;
  /** Guidance on how to resolve the issue, as HTML. */
  @property({ type: String }) solution?: string;
  /** The fix offered for this issue: what to run, and the label of the button that runs it. */
  @property({ attribute: false }) correction?: ViolationCorrection;

  @state() private view: ValidationItemView = 'explanation';

  @consume({ context: identifierContext, subscribe: true })
  @property({ attribute: false })
  private readonly identifier?: string;

  readonly #listItemRef: Ref<HTMLDivElement> = createRef();
  readonly #solutionLinkRef: Ref<ClippyButton> = createRef();
  readonly #backLinkRef: Ref<ClippyButton> = createRef();

  override focus(): void {
    this.#listItemRef.value?.focus();
  }

  readonly #focusNode = () => {
    if (!this.range) return;
    this.dispatchEvent(
      new CustomEvent<FocusNodeDetail>(CustomEvents.FOCUS_NODE, {
        bubbles: true,
        composed: true,
        detail: { range: this.range },
      }),
    );
  };

  readonly #applyFix = () => {
    this.dispatchEvent(
      new CustomEvent<CorrectValidationIssueDetail>(CustomEvents.CORRECT_VALIDATION_ISSUE, {
        bubbles: true,
        composed: true,
        detail: { identifier: this.identifier },
      }),
    );
    this.correction?.execute();
  };

  readonly #showSolution = () => {
    this.view = 'solution';
  };

  readonly #showExplanation = () => {
    this.view = 'explanation';
  };

  readonly #getAlertIcon = () => {
    switch (this.severity) {
      case 'error':
        return AlertTriangleIcon;
      case 'warning':
        return AlertCircleIcon;
      default:
        return InfoCircleIcon;
    }
  };

  override updated(changedProperties: PropertyValues): void {
    if (!changedProperties.has('view') || changedProperties.get('view') === undefined) return;

    const landing = this.view === 'solution' ? this.#backLinkRef.value : this.#solutionLinkRef.value;
    landing?.updateComplete.then(() => landing.shadowRoot?.querySelector('button')?.focus());
  }

  #renderBody() {
    if (this.view === 'solution') return html`${unsafeHTML(this.solution ?? '')}`;

    return html`<slot name="solution-html">${unsafeHTML(this.explanation ?? this.solution ?? '')}</slot>`;
  }

  #renderViewToggleButton() {
    if (this.view === 'solution') {
      return html`<clippy-button
        purpose="subtle"
        aria-describedby=${ariaDescribedBy}
        @click=${this.#showExplanation}
        ${ref(this.#backLinkRef)}
      >
        <clippy-icon slot="iconStart">${unsafeSVG(ArrowLeftIcon)}</clippy-icon>
        ${msg('Back')}
      </clippy-button>`;
    }

    return html`<clippy-button
      purpose="subtle"
      aria-describedby=${ariaDescribedBy}
      @click=${this.#showSolution}
      ${ref(this.#solutionLinkRef)}
    >
      ${msg('Solution')}
    </clippy-button>`;
  }

  #renderLinks() {
    const hasViewButton = this.view === 'solution' || this.explanation !== undefined;
    if (!hasViewButton && !this.href) return nothing;

    return html`
      <div class="clippy-validation-item__links">
        ${hasViewButton ? this.#renderViewToggleButton() : nothing}
        ${
          this.href
            ? html`<a
                class="nl-link clippy-validation-item__extensive-explanation"
                href="${this.href}"
                target="_blank"
                rel="noreferrer"
                aria-describedby=${ariaDescribedBy}
              >
                ${msg('Extensive explanation')}
                <clippy-icon>${unsafeSVG(ExternalLinkIcon)}</clippy-icon>
              </a>`
            : nothing
        }
      </div>
    `;
  }

  #renderActions() {
    if (this.mode === validationInteractionMode.READONLY) {
      return nothing;
    }

    return html`
      <div class="clippy-validation-item-actions">
        ${
          typeof this.correction?.execute === 'function'
            ? html`<clippy-button purpose="primary" @click=${this.#applyFix} aria-describedby=${ariaDescribedBy}>
                ${this.correction.label ?? msg('Correct')}
              </clippy-button>`
            : nothing
        }
        <clippy-button purpose="secondary" @click=${this.#focusNode} aria-describedby=${ariaDescribedBy}>
          ${msg('Focus')}
        </clippy-button>
      </div>
    `;
  }

  override render() {
    return html`
      <div
        ${ref(this.#listItemRef)}
        class="clippy-validation-item clippy-validation-item--${this.severity}"
        tabindex="-1"
      >
        <div class="clippy-validation-item__title">
          <span class="clippy-validation-item-severity clippy-validation-item-severity--${this.severity}">
            ${unsafeSVG(this.#getAlertIcon())}
          </span>
          <h4 class="nl-heading nl-heading--level-4" id=${ariaDescribedBy}>${this.heading}</h4>
        </div>
        <div class="clippy-validation-item__message">${this.#renderBody()} ${this.#renderLinks()}</div>
        <div class="clippy-validation-item__footer">${this.#renderActions()}</div>
      </div>
    `;
  }
}
