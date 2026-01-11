import './index.ts';
import type { Editor } from '@tiptap/core';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { page } from 'vitest/browser';
import { createTestEditor } from '../../../../test/createTestEditor';
import { CustomEvents } from '../../../events';
import { ValidationResult } from '../../../types/validation';
import { contentValidations, documentValidations } from '../../../validators/constants';

describe('<clippy-validations-dialog>', () => {
  let container: HTMLElement;
  let editor: Editor;

  beforeEach(async () => {
    container = document.createElement('div');
    document.body.appendChild(container);
    editor = await createTestEditor('');
  });

  afterEach(() => {
    document.body.removeChild(container);
    editor.destroy();
  });

  it('opens dialog when OPEN_VALIDATIONS_DIALOG event is dispatched', async () => {
    container.innerHTML = '<clippy-validations-dialog></clippy-validations-dialog>';
    const element = container.querySelector('clippy-validations-dialog');

    if (element) {
      element.editor = editor;
      await element.updateComplete;
    }
    const dialog = page.getByTestId('clippy-validations-drawer');
    expect(dialog).not.toHaveAttribute('open');

    globalThis.dispatchEvent(new CustomEvent(CustomEvents.OPEN_VALIDATIONS_DIALOG));
    await element?.updateComplete;

    expect(dialog).toHaveAttribute('open');
  });

  it('renders large validations map with all validation items', async () => {
    container.innerHTML = '<clippy-validations-dialog></clippy-validations-dialog>';
    const element = container.querySelector('clippy-validations-dialog');

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

    if (element) {
      element.editor = editor;
      element.validationsContext = validationsMap;
      await element.updateComplete;
    }

    const validationList = page.getByTestId('clippy-validations-list').element();

    const validationItems = validationList?.querySelectorAll('clippy-validation-list-item');
    expect(validationItems?.length).toBe(10);

    // Verify first validation item has correct attributes
    const firstItem = validationItems?.[0];
    expect(firstItem?.shadowRoot?.querySelector('strong')?.innerText).toBe('Koptekst mag niet leeg zijn');
  });
});
