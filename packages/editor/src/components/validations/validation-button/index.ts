import { localized, msg, str } from '@lit/localize';
import { safeCustomElement } from '@nl-design-system-community/clippy-components/lib/decorators';
import { html, LitElement, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import type { Violation } from '@/types/validation';
import { CustomEvents, type OpenValidationGroupDetail } from '@/events';
import { localizeHost } from '@/localization';
import { applyHoverHighlight, clearHoverHighlight } from '@/utils/highlights';
import { severityIcon } from '@/utils/validations';
import validationButtonStyles from './styles';

const tag = 'clippy-validation-button';

/**
 * Icon-only button, in the color of the highest severity, that opens validations in the
 * drawer of a Clippy hub. While it is hovered or focused, it highlights the text of the first
 * validation when that is inline, as the gutter does. Renders nothing without validations.
 *
 * @tag clippy-validation-button
 *
 * @fires {OpenValidationGroupEvent} OPEN_VALIDATION_GROUP - Dispatched on `globalThis` on click.
 *
 * @example
 * ```html
 * <clippy-validation-button></clippy-validation-button>
 * ```
 */
@localized()
@safeCustomElement(tag)
export class ValidationButton extends LitElement {
  static override readonly styles = [validationButtonStyles];

  /** The violations to open, highest severity first. */
  @property({ attribute: false })
  violations: Violation[] = [];

  /** The hub identifier that scopes the event. */
  @property({ attribute: false })
  identifier?: string;

  override connectedCallback() {
    super.connectedCallback();
    localizeHost(this);
  }

  override disconnectedCallback() {
    clearHoverHighlight();
    super.disconnectedCallback();
  }

  readonly #highlight = () => {
    const [{ display, range, severity }] = this.violations;
    if (display === 'inline' && range) applyHoverHighlight(severity, range);
  };

  readonly #open = () => {
    const ranges = this.violations.map(({ range }) => range).filter((range) => range !== undefined);
    globalThis.dispatchEvent(
      new CustomEvent<OpenValidationGroupDetail>(CustomEvents.OPEN_VALIDATION_GROUP, {
        detail: { identifier: this.identifier, ranges },
      }),
    );
  };

  override render() {
    if (this.violations.length === 0) return nothing;
    const [{ messages, severity }] = this.violations;
    const title = messages.title.replace(/\.$/, '');
    return html`<button
      class="clippy-validation-button clippy-validation-button--${severity}"
      type="button"
      aria-label=${msg(str`Open validation '${title}'`)}
      @click=${this.#open}
      @mouseenter=${this.#highlight}
      @mouseleave=${clearHoverHighlight}
      @focus=${this.#highlight}
      @blur=${clearHoverHighlight}
    >
      ${unsafeSVG(severityIcon(severity))}
    </button>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [tag]: ValidationButton;
  }
}
