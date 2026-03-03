import { describe, it, expect, vi, beforeEach } from 'vitest';
import { page } from 'vitest/browser';
import type { ValidationResult } from '../../../types/validation';
import type { Context } from '../../context';
import { CustomEvents } from '../../../events';
import { contentValidations, documentValidations } from '../../../validators/constants';
import '../../context/index.ts';
import './index.ts';

describe('<clippy-validations-dialog>', () => {
  beforeEach(async () => {
    document.documentElement.lang = 'nl';
    document.body.innerHTML = `
      <clippy-context>
        <clippy-validations-dialog></clippy-validations-dialog>
      </clippy-context>
    `;
  });

  it('opens dialog when OPEN_VALIDATIONS_DIALOG event is dispatched', async () => {
    await vi.waitFor(() => {
      expect(page.getByTestId('clippy-validations-drawer')).toBeInTheDocument();
    });

    const dialog = page.getByTestId('clippy-validations-drawer');
    expect(dialog).not.toHaveAttribute('open');
    expect(dialog.element()).not.toHaveAttribute('open');
    globalThis.dispatchEvent(new CustomEvent(CustomEvents.OPEN_VALIDATIONS_DIALOG));
    expect(dialog).toHaveAttribute('open');
  });

  it('renders large validations map with all validation items', async () => {
    const contextElement = document.querySelector('clippy-context') as Context | null;

    await vi.waitFor(() => {
      expect(page.getByTestId('clippy-validations-drawer')).toBeInTheDocument();
    });

    const validationsMap: Map<string, Omit<ValidationResult, 'tipPayload'>> = new Map([
      [
        `${contentValidations.HEADING_MUST_NOT_BE_EMPTY}_1`,
        {
          boundingBox: null,
          pos: 1,
          severity: 'error' as const,
        },
      ],
      [`${contentValidations.IMAGE_MUST_HAVE_ALT_TEXT}_5`, { boundingBox: null, pos: 5, severity: 'error' }],
      [`${contentValidations.LINK_SHOULD_NOT_BE_TOO_GENERIC}_10`, { boundingBox: null, pos: 10, severity: 'warning' }],
      [
        `${contentValidations.NODE_SHOULD_NOT_BE_EMPTY}_15`,
        { boundingBox: null, pos: 15, severity: 'warning', tipPayload: { nodeType: 'paragraph' } },
      ],
      [
        `${contentValidations.MARK_SHOULD_NOT_BE_EMPTY}_20`,
        { boundingBox: null, pos: 20, severity: 'error', tipPayload: { nodeType: 'link' } },
      ],
      [
        `${documentValidations.DOCUMENT_MUST_HAVE_CORRECT_HEADING_ORDER}_25`,
        {
          boundingBox: null,
          pos: 25,
          severity: 'error',
          tipPayload: { headingLevel: 3, precedingHeadingLevel: 1 },
        },
      ],
      [
        `${documentValidations.DOCUMENT_MUST_HAVE_SEMANTIC_LISTS}_30`,
        { boundingBox: null, pos: 30, severity: 'warning', tipPayload: { prefix: '-' } },
      ],
      [
        `${contentValidations.HEADING_SHOULD_NOT_CONTAIN_BOLD_OR_ITALIC}_35`,
        { boundingBox: null, pos: 35, severity: 'warning' },
      ],
      [`${contentValidations.MARK_SHOULD_NOT_BE_UNDERLINED}_40`, { boundingBox: null, pos: 40, severity: 'warning' }],
      [
        `${documentValidations.DOCUMENT_MUST_HAVE_TOP_LEVEL_HEADING_ONE}_45`,
        { boundingBox: null, pos: 45, severity: 'error', tipPayload: { topHeadingLevel: 1 } },
      ],
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
