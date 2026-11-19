import { localized, msg, str } from '@lit/localize';
import numberBadgeStyles from '@nl-design-system-candidate/number-badge-css/number-badge.css?inline';
import { validationSeverity, type ValidationSeverity } from '@nl-design-system-community/clippy-a11y-validator';
import { safeCustomElement } from '@nl-design-system-community/clippy-components/lib/decorators';
import AlertCircleIcon from '@tabler/icons/outline/alert-circle.svg?raw';
import AlertTriangleIcon from '@tabler/icons/outline/alert-triangle.svg?raw';
import InfoCircleIcon from '@tabler/icons/outline/info-circle.svg?raw';
import { html, LitElement, nothing, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import type { Violation } from '@/types/validation';
import { CustomEvents, type OpenValidationGroupDetail } from '@/events';
import { localizeHost } from '@/localization';
import { validationSeverityOrder } from '@/utils/validations';
import toggleStyles from './styles';

const tag = 'clippy-validation-toggle';

const severityIcon = (severity: ValidationSeverity): string => {
  switch (severity) {
    case validationSeverity.ERROR:
      return AlertTriangleIcon;
    case validationSeverity.WARNING:
      return AlertCircleIcon;
    default:
      return InfoCircleIcon;
  }
};

/**
 * Button that opens a group of validations in the validations sidebar of a Clippy hub,
 * shown with the icon of the highest severity and, for several validations, their number.
 *
 * @tag clippy-validation-toggle
 *
 * @fires {OpenValidationGroupEvent} OPEN_VALIDATION_GROUP - Dispatched on `globalThis` on click.
 *
 * @example
 * ```html
 * <clippy-validation-toggle></clippy-validation-toggle>
 * ```
 */
@localized()
@safeCustomElement(tag)
export class ValidationToggle extends LitElement {
  static override readonly styles = [toggleStyles, unsafeCSS(numberBadgeStyles)];

  /** The validations to open. Renders nothing while empty. */
  @property({ attribute: false })
  entries: [Range, Violation][] = [];

  /** Identifier of the Clippy hub, used to scope the sidebar event. */
  @property({ attribute: false })
  identifier?: string;

  override connectedCallback() {
    super.connectedCallback();
    localizeHost(this);
  }

  readonly #open = () => {
    globalThis.dispatchEvent(
      new CustomEvent<OpenValidationGroupDetail>(CustomEvents.OPEN_VALIDATION_GROUP, {
        detail: { identifier: this.identifier, ranges: this.entries.map(([range]) => range) },
      }),
    );
  };

  override render() {
    const violations = this.entries.map(([, violation]) => violation);
    if (violations.length === 0) return nothing;
    const count = violations.length;
    const severity =
      validationSeverityOrder.find((candidate) => violations.some((violation) => violation.severity === candidate)) ??
      violations[0].severity;
    const title = violations[0].messages.title.replace(/\.$/, '');
    return html`<button
      class="clippy-validation-toggle clippy-validation-toggle--${severity}"
      type="button"
      aria-label=${count > 1 ? msg(str`Open ${count} validations`) : msg(str`Open validation '${title}'`)}
      @click=${this.#open}
    >
      ${
        count > 1
          ? html`<span class="nl-number-badge clippy-validation-toggle__badge" aria-hidden="true">${count}</span>`
          : nothing
      }
      <span class="clippy-validation-toggle__icon" aria-hidden="true">${unsafeSVG(severityIcon(severity))}</span>
    </button>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [tag]: ValidationToggle;
  }
}
