import { consume } from '@lit/context';
import { localized, msg, str } from '@lit/localize';
import buttonCss from '@nl-design-system-candidate/button-css/button.css?inline';
import numberBadgeStyles from '@nl-design-system-candidate/number-badge-css/number-badge.css?inline';
import { safeCustomElement } from '@nl-design-system-community/clippy-components/lib/decorators';
import AccessibleIcon from '@tabler/icons/outline/accessible.svg?raw';
import ChevronDownIcon from '@tabler/icons/outline/chevron-down.svg?raw';
import { LitElement, html, nothing, unsafeCSS } from 'lit';
import { property, state } from 'lit/decorators.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import '@nl-design-system-community/clippy-components/clippy-button';
import '@nl-design-system-community/clippy-components/clippy-icon';
import type { ValidationsMap } from '@/types/validation';
import { identifierContext } from '@/context/identifierContext';
import { validationsContext } from '@/context/validationsContext';
import { CustomEvents, type DocumentOverviewMode, type OpenDocumentOverviewDetail } from '@/events';
import notificationsStyles from './styles';

const tag = 'clippy-accessibility-notifications';

declare global {
  interface HTMLElementTagNameMap {
    [tag]: AccessibilityNotifications;
  }
}

/**
 * Toolbar trigger that opens the document overview via a global
 * {@link CustomEvents.OPEN_DOCUMENT_OVERVIEW} event; a badge reflects the
 * validation count from {@link validationsContext}.
 *
 * @tag clippy-accessibility-notifications
 */
@localized()
@safeCustomElement(tag)
export class AccessibilityNotifications extends LitElement {
  static override readonly styles = [notificationsStyles, unsafeCSS(numberBadgeStyles), unsafeCSS(buttonCss)];

  /** @internal Consumed from the nearest {@link validationsContext} provider. */
  @consume({ context: validationsContext, subscribe: true })
  @property({ attribute: false })
  validationsContext?: ValidationsMap;

  /** @internal Consumed from the nearest {@link identifierContext} provider. */
  @consume({ context: identifierContext, subscribe: true })
  @property({ attribute: false })
  private readonly identifierContextValue?: string;

  /**
   * Validation results for standalone use (outside `<clippy-context>`, e.g.
   * embedded in CKEditor). Takes precedence over {@link validationsContext} when
   * set; falls back to the consumed context otherwise (in-editor use).
   */
  @property({ attribute: false })
  validationsMap?: ValidationsMap;

  /**
   * Identifier of the editor instance this trigger belongs to, for standalone
   * use (outside `<clippy-context>`, e.g. embedded in CKEditor). Must match the
   * identifier of the drawer it should open. Falls back to the consumed
   * {@link identifierContext} when unset (in-editor use).
   */
  @property({ attribute: false })
  identifier?: string;

  @state() private _expanded = false;

  readonly #togglePanel = () => {
    this._expanded = !this._expanded;
  };

  readonly #openOverview = (mode: DocumentOverviewMode = 'validations') => {
    this._expanded = false;
    globalThis.dispatchEvent(
      new CustomEvent<OpenDocumentOverviewDetail>(CustomEvents.OPEN_DOCUMENT_OVERVIEW, {
        detail: { identifier: this.identifier ?? this.identifierContextValue, mode },
      }),
    );
  };

  readonly #handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') this._expanded = false;
  };

  override connectedCallback() {
    super.connectedCallback();
    this.addEventListener('keydown', this.#handleKeydown);
  }

  override disconnectedCallback() {
    this.removeEventListener('keydown', this.#handleKeydown);
    super.disconnectedCallback();
  }

  /** Focus the notifications trigger button. */
  override focus() {
    this.shadowRoot?.querySelector('clippy-button')?.shadowRoot?.querySelector('button')?.focus();
  }

  override render() {
    const { size = 0 } = this.validationsMap ?? this.validationsContext ?? {};
    return html`
      <span data-toolbar-item="accessibility-notifications" class="clippy-accessibility-notifications">
        <clippy-button
          @click=${this.#togglePanel}
          aria-expanded=${this._expanded}
          .pressed=${this._expanded}
          icon-only
          size="small"
          purpose="subtle"
          toggle
        >
          <clippy-icon slot="iconStart">${unsafeSVG(AccessibleIcon)}</clippy-icon>
          ${msg('Show accessibility notifications')}
          <clippy-icon slot="iconEnd">${unsafeSVG(ChevronDownIcon)}</clippy-icon>
        </clippy-button>
        ${size > 0 ? html`<span class="clippy-accessibility-notifications__dot-badge" aria-hidden="true"></span>` : nothing}
        ${
          this._expanded
            ? html`
                <div class="clippy-accessibility-notifications__panel">
                  <button class="nl-button nl-button--subtle" @click=${() => this.#openOverview()}>
                    ${msg('Errors, warnings and tips')}
                    ${size > 0 ? html`<span class="nl-number-badge">${size}</span>` : nothing}
                  </button>
                  <button class="nl-button nl-button--subtle" @click=${() => this.#openOverview('heading-structure')}>
                    ${msg('Heading structure')}
                  </button>
                  <button class="nl-button nl-button--subtle" @click=${() => this.#openOverview('link-list')}>
                    ${msg('Links')}
                  </button>
                  <button class="nl-button nl-button--subtle" @click=${() => this.#openOverview('language-changes')}>
                    ${msg('Language changes')}
                  </button>
                </div>
              `
            : nothing
        }
      </span>
      <div class="clippy-screen-reader-text" aria-live=${size > 0 ? 'polite' : 'off'}>
        ${msg(str`Total ${size} accessibility notifications found.`)}
      </div>
    `;
  }
}
