import { consume } from '@lit/context';
import { localized, msg } from '@lit/localize';
import headingStyle from '@nl-design-system-candidate/heading-css/heading.css?inline';
import linkCss from '@nl-design-system-candidate/link-css/link.css?inline';
import paragraphStyle from '@nl-design-system-candidate/paragraph-css/paragraph.css?inline';
import { safeCustomElement } from '@nl-design-system-community/clippy-components/lib/decorators';
import AlertCircleIcon from '@tabler/icons/outline/alert-circle.svg?raw';
import AlertTriangleIcon from '@tabler/icons/outline/alert-triangle.svg?raw';
import InfoCircleIcon from '@tabler/icons/outline/info-circle.svg?raw';
import ListDetailsIcon from '@tabler/icons/outline/list-details.svg?raw';
import { LitElement, html, nothing, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import { createRef, ref, type Ref } from 'lit/directives/ref.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import '@nl-design-system-community/clippy-components/clippy-button';
import '@nl-design-system-community/clippy-components/clippy-icon';
import type { CorrectValidationFunction, ValidationSeverity } from '@/types/validation.ts';
import { identifierContext } from '@/context/identifierContext.ts';
import {
  CustomEvents,
  type CorrectValidationIssueDetail,
  type FocusNodeDetail,
  type FocusValidationItemInDrawerDetail,
} from '@/events';
import validationListItemStyles from './styles.ts';

const tag = 'clippy-validation-item';

declare global {
  interface HTMLElementTagNameMap {
    [tag]: ValidationItem;
  }
}

const ariaDescribedBy = 'validation-item-header';

/**
 * A single accessibility validation result card. Displays the severity icon,
 * description, optional tip, and action buttons (Focus, Correct, Open in drawer).
 * The `mode` property controls which actions are visible.
 *
 * @tag clippy-validation-item
 *
 * @slot tip-html - Optional HTML content rendered as additional guidance below
 *   the description. Wrap content in a `<p>` element.
 *
 * @fires {CustomEvent<FocusNodeDetail>} FOCUS_NODE - Dispatched when the user clicks "Focus",
 *   carrying `detail.range` so the editor can scroll to the relevant node.
 * @fires {CustomEvent<CorrectValidationIssueDetail>} CORRECT_VALIDATION_ISSUE - Dispatched when the user
 *   clicks "Correct", triggering the auto-fix callback.
 * @fires {CustomEvent<FocusValidationItemInDrawerDetail>} FOCUS_VALIDATION_ITEM_IN_DRAWER - Dispatched in `tooltip`
 *   mode when the user clicks the "Open in drawer" icon button.
 *
 * @example
 * ```html
 * <clippy-validation-item
 *   severity="error"
 *   description="Missing alt text on image"
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
  ];

  /**
   * Display context for the item's action buttons.
   * - `list` (default) – Focus and Correct buttons.
   * - `tooltip` – additionally shows an "Open in drawer" button.
   * - `readonly` – no action buttons rendered.
   */
  @property({ type: String }) mode: 'tooltip' | 'list' | 'readonly' = 'list';
  /** The DOM `Range` that this validation issue relates to. */
  @property({ attribute: false }) range?: Range;
  /** Severity level of the validation issue. */
  @property({ type: String }) severity!: ValidationSeverity;
  /** Human-readable description of the validation issue. */
  @property({ type: String }) description!: string;
  /** Optional URL linking to a more extensive explanation of the WCAG criterion. */
  @property({ type: String }) href?: string;
  /** Custom label for the auto-fix button. Falls back to "Correct". */
  @property({ type: String }) customCorrectLabel?: string;
  /** Optional function that applies the automatic fix for this issue. */
  @property({ type: Function }) correct?: CorrectValidationFunction;

  @consume({ context: identifierContext, subscribe: true })
  @property({ attribute: false })
  private readonly identifier?: string;

  readonly #listItemRef: Ref<HTMLDivElement> = createRef();

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
    if (typeof this.correct === 'function') {
      this.correct();
    }
  };

  #handleValidationItemClick(event: Event) {
    event.stopPropagation();
    this.dispatchEvent(
      new CustomEvent<FocusValidationItemInDrawerDetail>(CustomEvents.FOCUS_VALIDATION_ITEM_IN_DRAWER, {
        bubbles: true,
        composed: true,
        detail: { identifier: this.identifier, range: this.range },
      }),
    );
  }

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

  #renderActions() {
    if (this.mode === 'readonly') {
      return nothing;
    }

    return html`
      <div class="clippy-validation-item-actions">
        ${
          typeof this.correct === 'function'
            ? html`<clippy-button purpose="primary" @click=${this.#applyFix} aria-describedby=${ariaDescribedBy}>
                ${this.customCorrectLabel ?? msg('Correct')}
              </clippy-button>`
            : nothing
        }
        <clippy-button purpose="secondary" @click=${this.#focusNode} aria-describedby=${ariaDescribedBy}>
          ${msg('Focus')}
        </clippy-button>
        ${
          this.mode === 'tooltip'
            ? html`<clippy-button
                @click=${(event: Event) => this.#handleValidationItemClick(event)}
                icon-only
                purpose="subtle"
              >
                <clippy-icon slot="iconStart">${unsafeSVG(ListDetailsIcon)}</clippy-icon>
                ${msg('Open in drawer')}
              </clippy-button>`
            : nothing
        }
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
          <h4 class="nl-heading nl-heading--level-4" id=${ariaDescribedBy}>${this.description}</h4>
        </div>
        <div class="clippy-validation-item__message">
          <slot name="tip-html"></slot>
          ${
            this.href
              ? html`
                  <p class="nl-paragraph">
                    <a
                      class="nl-link"
                      href="${this.href}"
                      target="_blank"
                      rel="noreferrer"
                      aria-describedby=${ariaDescribedBy}
                    >
                      ${msg('Extensive explanation')}
                    </a>
                  </p>
                `
              : null
          }
        </div>
        <div class="clippy-validation-item__footer">${this.#renderActions()}</div>
      </div>
    `;
  }
}
