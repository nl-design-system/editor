import { provide } from '@lit/context';
import { safeCustomElement } from '@nl-design-system-community/clippy-components/lib/decorators';
import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import type { ValidationsMap } from '@/types/validation';
import { htmlDocumentContext } from '@/context/htmlDocumentContext';
import { identifierContext } from '@/context/identifierContext';
import { validationsContext } from '@/context/validationsContext';
import './index';
import '../../validations/drawer';

const tag = 'clippy-accessibility-notifications-panel';

declare global {
  interface HTMLElementTagNameMap {
    [tag]: AccessibilityNotificationsPanel;
  }
}

/**
 * Self-contained accessibility-notifications feature for use outside of
 * `clippy-editor` (e.g. inside CKEditor). Provides the Lit contexts its
 * descendants consume and renders the trigger button and drawer.
 *
 * @tag clippy-accessibility-notifications-panel
 */
@safeCustomElement(tag)
export class AccessibilityNotificationsPanel extends LitElement {
  @provide({ context: validationsContext })
  @property({ attribute: false })
  validationsMap: ValidationsMap = new Map();

  /** Must be the same DOM tree the ranges in {@link validationsMap} point into. */
  @provide({ context: htmlDocumentContext })
  @property({ attribute: false })
  htmlDocument?: HTMLElement;

  @provide({ context: identifierContext })
  @property({ type: String })
  identifier = 'clippy-accessibility-notifications';

  override focus() {
    this.shadowRoot?.querySelector('clippy-accessibility-notifications')?.focus();
  }

  override render() {
    return html`
      <clippy-accessibility-notifications></clippy-accessibility-notifications>
      <clippy-validations-drawer></clippy-validations-drawer>
    `;
  }
}
