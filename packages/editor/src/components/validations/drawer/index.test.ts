import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { page } from 'vitest/browser';
import type { ValidationResult } from '../../../types/validation';
import type { Context } from '../../context';
import { blockValidations, documentValidations, inlineValidations } from '../../../constants';
import '../../context/index.ts';
import './index.ts';
import { CustomEvents } from '../../../events';

const TEST_IDENTIFIER = 'test-editor-id';

describe('<clippy-validations-dialog>', () => {
  beforeEach(() => {
    document.documentElement.lang = 'nl';
    document.body.innerHTML = `
      <clippy-context id="${TEST_IDENTIFIER}">
        <clippy-validations-dialog></clippy-validations-dialog>
      </clippy-context>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('opens dialog when OPEN_VALIDATIONS_DIALOG event is dispatched with matching identifier', async () => {
    await vi.waitFor(() => {
      expect(page.getByTestId('clippy-validations-drawer')).toBeInTheDocument();
    });

    const dialog = page.getByTestId('clippy-validations-drawer');
    expect(dialog).not.toHaveAttribute('open');
    expect(dialog.element()).not.toHaveAttribute('open');
    globalThis.dispatchEvent(
      new CustomEvent(CustomEvents.OPEN_VALIDATIONS_DIALOG, { detail: { identifier: TEST_IDENTIFIER } }),
    );
    expect(dialog).toHaveAttribute('open');
  });

  it('does not open dialog when OPEN_VALIDATIONS_DIALOG event has a different identifier', async () => {
    await vi.waitFor(() => {
      expect(page.getByTestId('clippy-validations-drawer')).toBeInTheDocument();
    });

    const dialog = page.getByTestId('clippy-validations-drawer');
    expect(dialog.element()).not.toHaveAttribute('open');
    globalThis.dispatchEvent(
      new CustomEvent(CustomEvents.OPEN_VALIDATIONS_DIALOG, { detail: { identifier: 'other-editor-id' } }),
    );
    expect(dialog.element()).not.toHaveAttribute('open');
  });

  it('renders large validations map with all validation items', async () => {
    const contextElement = document.querySelector('clippy-context') as Context | null;

    await vi.waitFor(() => {
      expect(page.getByTestId('clippy-validations-drawer')).toBeInTheDocument();
    });

    /** Helper: create a ValidationResult keyed by a fresh Range with validatorKey set. */
    const entry = (
      validatorKey: string,
      severity: ValidationResult['severity'],
      tipPayload?: ValidationResult['tipPayload'],
    ): [Range, ValidationResult] => {
      const range = document.createRange();
      return [range, { severity, tipPayload, validatorKey }];
    };

    const validationsMap: Map<Range, ValidationResult> = new Map([
      entry(blockValidations.HEADING_MUST_NOT_BE_EMPTY, 'error'),
      entry(blockValidations.IMAGE_MUST_HAVE_ALT_TEXT, 'error'),
      entry(inlineValidations.LINK_SHOULD_NOT_BE_TOO_GENERIC, 'warning'),
      entry(blockValidations.NODE_SHOULD_NOT_BE_EMPTY, 'warning', { nodeType: 'paragraph' }),
      entry(inlineValidations.INLINE_SHOULD_NOT_BE_EMPTY, 'error', { nodeType: 'link' }),
      entry(documentValidations.DOCUMENT_MUST_HAVE_CORRECT_HEADING_ORDER, 'error', {
        headingLevel: 3,
        precedingHeadingLevel: 1,
      }),
      entry(blockValidations.PARAGRAPH_SHOULD_NOT_RESEMBLE_LIST, 'warning', { prefix: '-' }),
      entry(blockValidations.HEADING_SHOULD_NOT_CONTAIN_BOLD_OR_ITALIC, 'warning'),
      entry(inlineValidations.INLINE_SHOULD_NOT_BE_UNDERLINED, 'warning'),
      entry(documentValidations.DOCUMENT_MUST_HAVE_TOP_LEVEL_HEADING_ONE, 'error', { topHeadingLevel: 1 }),
    ]);

    // Set validationsContext on the context provider, which will provide it to children
    if (contextElement) {
      contextElement.updateValidationsContext(validationsMap);
      await contextElement.updateComplete;
    }

    const listSelector = page.getByTestId('clippy-validations-list');
    await vi.waitFor(() => {
      expect(listSelector).toBeInTheDocument();
    });

    await vi.waitFor(() => {
      const items = listSelector.element()?.querySelectorAll('clippy-validation-item');
      expect(items?.length).toBe(10);
    });

    const validationItems = listSelector.element()?.querySelectorAll('clippy-validation-item');

    // Wait for the first item to render its shadow DOM
    if (validationItems?.[0]?.updateComplete) {
      await validationItems[0].updateComplete;
    }

    const firstItem = validationItems?.[0] as (Element & { description?: string }) | undefined;

    // Assert the description property is populated (locale-agnostic — avoids shadow DOM piercing)
    expect(firstItem?.description).toBeTruthy();

    // Verify the h4 in the shadow DOM renders the description text
    const heading = firstItem?.shadowRoot?.querySelector('h4');
    expect(heading).not.toBeNull();
    expect(heading?.textContent?.trim()).toBe(firstItem?.description);
  });
});
