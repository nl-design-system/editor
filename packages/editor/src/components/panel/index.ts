import { localized, msg } from '@lit/localize';
import { safeCustomElement } from '@nl-design-system-community/clippy-components/lib/decorators';
import srOnly from '@nl-design-system-community/clippy-components/lib/sr-only';
import { html, LitElement, nothing, type PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import '@nl-design-system-community/clippy-components/clippy-button';
import type { ClippyDocument } from '@/document';
import { getClippyDocument } from '@/document/getClippyDocument';
import styles from './styles';

const tag = 'clippy-panel';

declare global {
  interface HTMLElementTagNameMap {
    [tag]: Panel;
  }
}

/**
 * The accessibility report: every violation the Clippy document holds, in document order.
 *
 * @tag clippy-panel
 *
 * @example
 * ```html
 * <clippy-panel></clippy-panel>
 * <clippy-panel source="clippy-source-2"></clippy-panel>
 * ```
 */
@localized()
@safeCustomElement(tag)
export class Panel extends LitElement {
  static override readonly styles = [srOnly, styles];

  /** The Clippy document to report on. Defaults to `getClippyDocument()`. */
  @property({ attribute: false }) clippyDocument?: ClippyDocument;

  /** Optional source id. When set, only that source's violations are listed. */
  @property({ type: String }) source: string | null = null;

  #unsubscribe?: () => void;

  override connectedCallback() {
    super.connectedCallback();
    this.clippyDocument ??= getClippyDocument();
    this.#subscribe();
    this.requestUpdate();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.#unsubscribe?.();
    this.#unsubscribe = undefined;
  }

  override willUpdate(changed: PropertyValues<this>) {
    super.willUpdate(changed);
    if (changed.get('clippyDocument') && this.isConnected) this.#subscribe();
  }

  #subscribe() {
    this.#unsubscribe?.();
    this.#unsubscribe = this.clippyDocument?.subscribe(() => this.requestUpdate());
  }

  override render() {
    if (!this.clippyDocument) return null;

    const violations = this.clippyDocument.violations.filter(({ source }) => !this.source || source === this.source);

    return html`
      <ul class="clippy-panel" role="list">
        ${map(violations, (violation) => {
          const summary = html`
            <span class="clippy-panel__source">${violation.label}</span>
            <span class="clippy-panel__message">${violation.messages.error}</span>
          `;

          return html`
            <li class="clippy-panel__item">
              ${
                violation.focusable
                  ? html`<button
                      class="clippy-panel__summary clippy-panel__focus"
                      type="button"
                      @click=${() => this.clippyDocument?.dispatch({ type: 'focus', violation })}
                    >
                      ${summary}
                    </button>`
                  : html`<div class="clippy-panel__summary">${summary}</div>`
              }
              ${
                violation.correctable
                  ? html`<clippy-button
                      class="clippy-panel__correct"
                      purpose="secondary"
                      @click=${() => this.clippyDocument?.dispatch({ type: 'correct', violation })}
                    >
                      ${msg('Correct')}<span class="sr-only">: ${violation.messages.error}</span>
                    </clippy-button>`
                  : nothing
              }
            </li>
          `;
        })}
      </ul>
    `;
  }
}
