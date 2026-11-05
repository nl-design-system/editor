import type { ValidationSeverity, ViolationCorrection } from '@nl-design-system-community/clippy-a11y-validator';
import type { ClippyButton } from '@nl-design-system-community/clippy-components/clippy-button';
import { consume } from '@lit/context';
import { localized, msg } from '@lit/localize';
import buttonStyle from '@nl-design-system-candidate/button-css/button.css?inline';
import codeStyle from '@nl-design-system-candidate/code-css/code.css?inline';
import headingStyle from '@nl-design-system-candidate/heading-css/heading.css?inline';
import linkCss from '@nl-design-system-candidate/link-css/link.css?inline';
import paragraphStyle from '@nl-design-system-candidate/paragraph-css/paragraph.css?inline';
import { safeCustomElement } from '@nl-design-system-community/clippy-components/lib/decorators';
import AlertCircleIcon from '@tabler/icons/outline/alert-circle.svg?raw';
import AlertTriangleIcon from '@tabler/icons/outline/alert-triangle.svg?raw';
import ArrowLeftIcon from '@tabler/icons/outline/arrow-left.svg?raw';
import ChevronDownIcon from '@tabler/icons/outline/chevron-down.svg?raw';
import ExternalLinkIcon from '@tabler/icons/outline/external-link.svg?raw';
import InfoCircleIcon from '@tabler/icons/outline/info-circle.svg?raw';
import { LitElement, html, nothing, unsafeCSS, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { createRef, ref, type Ref } from 'lit/directives/ref.js';
import '@nl-design-system-community/clippy-components/clippy-button';
import '@nl-design-system-community/clippy-components/clippy-icon';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import '@/components/button-group';
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
 * The `mode` property controls which actions are visible. With more than one correction, the Correct
 * button runs the first and a menu button next to it offers the others.
 *
 * @tag clippy-validation-item
 *
 * @slot solution-html - Optional HTML content rendered as guidance below
 *   the heading, in place of the `explanation` property. Wrap content in a `<p>` element.
 *
 * @fires {CustomEvent<FocusNodeDetail>} FOCUS_NODE - Dispatched when the user clicks "Focus",
 *   carrying `detail.range` so the editor can scroll to the relevant node.
 * @fires {CustomEvent<CorrectValidationIssueDetail>} CORRECT_VALIDATION_ISSUE - Dispatched when the user
 *   clicks "Correct" or picks a correction from the menu, triggering the auto-fix callback.
 *
 * The corrections menu follows the WAI-ARIA menu button pattern: opening it focuses the first
 * correction, Arrow Down / Arrow Up move between them (wrapping), Home / End jump to the first / last,
 * and Escape closes it and returns focus to the menu button.
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
    unsafeCSS(buttonStyle),
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
  /** The fixes offered for this issue, primary first: what to run, and the label of the control that runs it. */
  @property({ attribute: false }) corrections?: ViolationCorrection[];

  @state() private view: ValidationItemView = 'explanation';

  @state() private correctionsMenuOpen = false;

  @consume({ context: identifierContext, subscribe: true })
  @property({ attribute: false })
  private readonly identifier?: string;

  readonly #listItemRef: Ref<HTMLDivElement> = createRef();
  readonly #solutionLinkRef: Ref<ClippyButton> = createRef();
  readonly #backLinkRef: Ref<ClippyButton> = createRef();
  readonly #correctionsMenuToggleRef: Ref<ClippyButton> = createRef();
  readonly #correctionsMenuRef: Ref<HTMLUListElement> = createRef();

  override focus(): void {
    this.#listItemRef.value?.focus();
  }

  readonly #focusNode = () => {
    if (!this.range) return;
    this.dispatchEvent(
      new CustomEvent<FocusNodeDetail>(CustomEvents.FOCUS_NODE, {
        bubbles: true,
        composed: true,
        detail: { identifier: this.identifier, range: this.range },
      }),
    );
  };

  readonly #applyFix = (correction: ViolationCorrection) => {
    this.correctionsMenuOpen = false;
    this.dispatchEvent(
      new CustomEvent<CorrectValidationIssueDetail>(CustomEvents.CORRECT_VALIDATION_ISSUE, {
        bubbles: true,
        composed: true,
        detail: { identifier: this.identifier },
      }),
    );
    correction.execute();
  };

  readonly #toggleCorrectionsMenu = async () => {
    this.correctionsMenuOpen = !this.correctionsMenuOpen;
    if (!this.correctionsMenuOpen) return;

    await this.updateComplete;
    this.#correctionsMenuItems()[0]?.focus();
  };

  readonly #closeCorrectionsMenu = () => {
    this.correctionsMenuOpen = false;
    this.#correctionsMenuToggleRef.value?.shadowRoot?.querySelector('button')?.focus();
  };

  #correctionsMenuItems(): HTMLButtonElement[] {
    return [...(this.#correctionsMenuRef.value?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]') ?? [])];
  }

  readonly #handleCorrectionsMenuKeydown = (event: KeyboardEvent) => {
    const items = this.#correctionsMenuItems();
    const current = items.indexOf(this.shadowRoot?.activeElement as HTMLButtonElement);

    switch (event.key) {
      case 'ArrowDown':
        items[(current + 1) % items.length]?.focus();
        break;
      case 'ArrowUp':
        items[(current - 1 + items.length) % items.length]?.focus();
        break;
      case 'Home':
        items[0]?.focus();
        break;
      case 'End':
        items.at(-1)?.focus();
        break;
      case 'Escape':
        this.#closeCorrectionsMenu();
        break;
      default:
        return;
    }
    event.preventDefault();
  };

  readonly #handleCorrectionsMenuFocusout = (event: FocusEvent) => {
    const next = event.relatedTarget as Node | null;
    if (next && this.#correctionsMenuRef.value?.contains(next)) return;
    if (next === this.#correctionsMenuToggleRef.value) return;
    this.correctionsMenuOpen = false;
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

  #renderCorrectionsMenu(alternatives: ViolationCorrection[]) {
    if (!this.correctionsMenuOpen) return nothing;

    return html`<ul
      slot="menu"
      role="menu"
      aria-label=${msg('More corrections')}
      @keydown=${this.#handleCorrectionsMenuKeydown}
      @focusout=${this.#handleCorrectionsMenuFocusout}
      ${ref(this.#correctionsMenuRef)}
    >
      ${alternatives.map(
        (correction) =>
          html`<li role="none">
            <button
              type="button"
              role="menuitem"
              tabindex="-1"
              class="nl-button nl-button--subtle clippy-validation-item__corrections-menu-item"
              @click=${() => this.#applyFix(correction)}
            >
              ${correction.label ?? msg('Correct')}
            </button>
          </li>`,
      )}
    </ul>`;
  }

  #renderCorrectButton(primary: ViolationCorrection, slot?: string) {
    return html`<clippy-button
      slot=${slot ?? nothing}
      purpose="primary"
      @click=${() => this.#applyFix(primary)}
      aria-describedby=${ariaDescribedBy}
    >
      ${primary.label ?? msg('Correct')}
    </clippy-button>`;
  }

  #renderCorrections() {
    const [primary, ...alternatives] = this.corrections ?? [];
    if (!primary) return nothing;
    if (alternatives.length === 0) return this.#renderCorrectButton(primary);

    return html`<clippy-button-group>
      ${this.#renderCorrectButton(primary, 'primary')}
      <clippy-button
        slot="secondary"
        purpose="primary"
        icon-only
        .expanded=${this.correctionsMenuOpen}
        @click=${this.#toggleCorrectionsMenu}
        ${ref(this.#correctionsMenuToggleRef)}
      >
        <clippy-icon slot="iconStart">${unsafeSVG(ChevronDownIcon)}</clippy-icon>
        ${msg('More corrections')}
      </clippy-button>
      ${this.#renderCorrectionsMenu(alternatives)}
    </clippy-button-group>`;
  }

  #renderActions() {
    if (this.mode === validationInteractionMode.READONLY) {
      return nothing;
    }

    return html`
      <div class="clippy-validation-item-actions">
        ${this.#renderCorrections()}
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
