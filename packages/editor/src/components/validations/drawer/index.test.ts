import { ContextProvider } from '@lit/context';
import { LitElement, html } from 'lit';
import './index.ts';
import { querySelectorDeep } from 'query-selector-shadow-dom';
import { describe, it, expect, afterEach } from 'vitest';
import { validationsContext } from '../../../context/validationsContext';
import { ValidationsMap } from '../../../types/validation';
import { documentValidations } from '../../../validators/constants';

class TestHost extends LitElement {
  // Correct: provider typed with the Context, not the value type
  private provider?: ContextProvider<typeof validationsContext>;

  private validations: ValidationsMap = new Map([
    [documentValidations.DOCUMENT_MUST_HAVE_HEADING_1, { boundingBox: null, pos: 1, severity: 'error' }],
    [
      documentValidations.DOCUMENT_MUST_HAVE_CORRECT_HEADING_ORDER,
      { boundingBox: null, pos: 2, severity: 'warning', tipPayload: { headingLevel: 3, precedingHeadingLevel: 1 } },
    ],
  ]);

  override connectedCallback(): void {
    super.connectedCallback();
    this.provider = new ContextProvider(this, {
      context: validationsContext,
      initialValue: this.validations,
    });
  }

  override render() {
    return html`<clippy-validations-dialog></clippy-validations-dialog>`;
  }
}
customElements.define('test-host', TestHost);

let host: TestHost | null = null;

afterEach(() => {
  host?.remove();
  host = null;
});

describe('clippy-validations-dialog context consumption', () => {
  it('receives context', async () => {
    host = document.createElement('test-host') as TestHost;
    document.body.appendChild(host);
    await host.updateComplete;

    const dialog = querySelectorDeep('clippy-validations-dialog');
    expect(dialog).toBeTruthy();
    await dialog!.updateComplete;

    expect(dialog!.validationsContext?.size).toBe(2);
    const text = dialog!.shadowRoot?.textContent ?? '';
    expect(text).toContain('Document moet een kopniveau 1 bevatten');
    expect(text).toContain('Document moet correcte kopvolgorde hebben');
  });

  it('updates when provider value changes', async () => {
    host = document.createElement('test-host') as TestHost;
    document.body.appendChild(host);
    await host.updateComplete;

    const dialog = querySelectorDeep('clippy-validations-dialog');
    expect(dialog).toBeTruthy();
    await dialog!.updateComplete;

    const newMap: ValidationsMap = new Map();
    host['provider']?.setValue(newMap);

    await dialog!.updateComplete;

    const updated = dialog!.shadowRoot?.textContent ?? '';
    expect(updated).toContain('Geen toegankelijkheidsfouten gevonden.');
  });
});
