import { coreValidationRules } from '@nl-design-system-community/clippy-a11y-validator';
import { validationResult } from '@test/validationResult';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { page } from 'vitest/browser';
import type { Context } from '@/components/context';
import type { ValidationResult } from '@/types/validation';
import '@/components/context';
import './index';
import { CustomEvents } from '@/events';

const TEST_IDENTIFIER = 'test-editor-id';

describe('<clippy-validations-dialog>', () => {
  beforeEach(() => {
    document.documentElement.lang = 'nl';
    document.body.innerHTML = `
      <clippy-context id="${TEST_IDENTIFIER}">
        <clippy-validations-drawer></clippy-validations-drawer>
      </clippy-context>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('opens dialog when OPEN_DOCUMENT_OVERVIEW event is dispatched with matching identifier', async () => {
    await vi.waitFor(() => {
      expect(page.getByTestId('clippy-validations-drawer')).toBeInTheDocument();
    });

    const drawer = page.getByTestId('clippy-validations-drawer');
    expect(drawer).toHaveAttribute('hidden');
    expect(drawer.element()).toHaveAttribute('hidden');
    globalThis.dispatchEvent(
      new CustomEvent(CustomEvents.OPEN_DOCUMENT_OVERVIEW, {
        detail: { identifier: TEST_IDENTIFIER, mode: 'validations' },
      }),
    );
    await expect.element(drawer).not.toHaveAttribute('hidden');
  });

  it('does not open dialog when OPEN_DOCUMENT_OVERVIEW targets another editor', async () => {
    await vi.waitFor(() => {
      expect(page.getByTestId('clippy-validations-drawer')).toBeInTheDocument();
    });

    const drawer = page.getByTestId('clippy-validations-drawer');
    expect(drawer.element()).toHaveAttribute('hidden');
    globalThis.dispatchEvent(
      new CustomEvent(CustomEvents.OPEN_DOCUMENT_OVERVIEW, {
        detail: { identifier: 'another-editor-id', mode: 'validations' },
      }),
    );
    expect(drawer.element()).toHaveAttribute('hidden');
  });

  it('does not open dialog when an unrelated event is dispatched', async () => {
    await vi.waitFor(() => {
      expect(page.getByTestId('clippy-validations-drawer')).toBeInTheDocument();
    });

    const drawer = page.getByTestId('clippy-validations-drawer');
    expect(drawer.element()).toHaveAttribute('hidden');
    globalThis.dispatchEvent(new CustomEvent('some-unrelated-event'));
    expect(drawer.element()).toHaveAttribute('hidden');
  });

  it('renders large validations map with all validation items', async () => {
    const contextElement = document.querySelector('clippy-context') as Context | null;

    await vi.waitFor(() => {
      expect(page.getByTestId('clippy-validations-drawer')).toBeInTheDocument();
    });

    /** Helper: create a ValidationResult keyed by a fresh Range. */
    const entry = (
      rule: string,
      severity: ValidationResult['severity'],
      payload?: ValidationResult['payload'],
    ): [Range, ValidationResult] => {
      const range = document.createRange();
      return [range, validationResult({ payload, range, rule, severity })];
    };

    const validationsMap: Map<Range, ValidationResult> = new Map([
      entry(coreValidationRules.HEADING_MUST_NOT_BE_EMPTY, 'error'),
      entry(coreValidationRules.IMAGE_MUST_HAVE_ALT_TEXT, 'error'),
      entry(coreValidationRules.LINK_SHOULD_NOT_BE_TOO_GENERIC, 'warning'),
      entry(coreValidationRules.PARAGRAPH_SHOULD_NOT_BE_EMPTY, 'warning'),
      entry(coreValidationRules.EMPHASIS_SHOULD_NOT_BE_EMPTY, 'error', { variant: 'bold' }),
      entry(coreValidationRules.HEADING_LEVEL_MUST_NOT_SKIP, 'error', {
        expectedHeadingLevel: 2,
        headingLevel: 3,
        precedingHeadingLevel: 1,
      }),
      entry(coreValidationRules.PARAGRAPH_SHOULD_NOT_RESEMBLE_LIST, 'warning', { prefix: '-' }),
      entry(coreValidationRules.HEADING_SHOULD_NOT_CONTAIN_BOLD_OR_ITALIC, 'warning'),
      entry(coreValidationRules.EMPHASIS_SHOULD_NOT_BE_UNDERLINED, 'warning'),
      entry(coreValidationRules.HEADING_MUST_START_AT_LEVEL_ONE, 'error', { topHeadingLevel: 1 }),
    ]);

    // Set validationsContext on the context provider, which will provide it to children
    if (contextElement) {
      contextElement.updateValidationsContext(validationsMap);
      await contextElement.updateComplete;
    }

    // Open the drawer so the list is rendered
    globalThis.dispatchEvent(
      new CustomEvent(CustomEvents.OPEN_DOCUMENT_OVERVIEW, {
        detail: { identifier: TEST_IDENTIFIER, mode: 'validations' },
      }),
    );

    const drawerEl = document.querySelector('clippy-validations-drawer');

    await vi.waitFor(() => {
      const listEl = drawerEl?.shadowRoot?.querySelector('clippy-validations-list');
      const items = listEl?.shadowRoot?.querySelectorAll('clippy-validation-item');
      expect(items?.length).toBe(10);
    });

    const listEl = drawerEl?.shadowRoot?.querySelector('clippy-validations-list');
    const validationItems = listEl?.shadowRoot?.querySelectorAll('clippy-validation-item');

    // Wait for the first item to render its shadow DOM
    if (validationItems?.[0]?.updateComplete) {
      await validationItems[0].updateComplete;
    }

    const firstItem = validationItems?.[0] as (Element & { heading?: string }) | undefined;

    // Assert the heading property is populated (locale-agnostic — avoids shadow DOM piercing)
    expect(firstItem?.heading).toBeTruthy();

    // Verify the h4 in the shadow DOM renders the heading text
    const heading = firstItem?.shadowRoot?.querySelector('h4');
    expect(heading).not.toBeNull();
    expect(heading?.textContent?.trim()).toBe(firstItem?.heading);
  });

  it('shows only the focused group and hides the filters on OPEN_VALIDATION_GROUP', async () => {
    const contextElement = document.querySelector('clippy-context') as Context | null;

    await vi.waitFor(() => {
      expect(page.getByTestId('clippy-validations-drawer')).toBeInTheDocument();
    });

    const r1 = document.createRange();
    const r2 = document.createRange();
    const r3 = document.createRange();
    const validationsMap: Map<Range, ValidationResult> = new Map([
      [r1, validationResult({ range: r1, rule: coreValidationRules.HEADING_MUST_NOT_BE_EMPTY, severity: 'error' })],
      [
        r2,
        validationResult({ range: r2, rule: coreValidationRules.LINK_SHOULD_NOT_BE_TOO_GENERIC, severity: 'warning' }),
      ],
      [r3, validationResult({ range: r3, rule: coreValidationRules.IMAGE_MUST_HAVE_ALT_TEXT, severity: 'error' })],
    ]);

    if (contextElement) {
      contextElement.updateValidationsContext(validationsMap);
      await contextElement.updateComplete;
    }

    // Open only the group of r1 + r2 (as if a gutter item with an overlap was clicked).
    globalThis.dispatchEvent(
      new CustomEvent(CustomEvents.OPEN_VALIDATION_GROUP, {
        detail: { identifier: TEST_IDENTIFIER, ranges: [r1, r2] },
      }),
    );

    const drawerEl = document.querySelector('clippy-validations-drawer');
    await expect.element(page.getByTestId('clippy-validations-drawer')).not.toHaveAttribute('hidden');

    // Only the two focused validations are rendered, not the third.
    await vi.waitFor(() => {
      const listEl = drawerEl?.shadowRoot?.querySelector('clippy-validations-list');
      const items = listEl?.shadowRoot?.querySelectorAll('clippy-validation-item');
      expect(items?.length).toBe(2);
    });

    // The severity filters are hidden while a group is focused.
    const filters = drawerEl?.shadowRoot?.querySelector('clippy-validation-filters');
    expect(filters).toHaveAttribute('hidden');

    // Clicking "Show all validations" clears the group and reveals every item + the filters.
    const showAll = drawerEl?.shadowRoot?.querySelector('.clippy-drawer__show-all');
    (showAll as HTMLElement | null)?.click();

    await vi.waitFor(() => {
      const listEl = drawerEl?.shadowRoot?.querySelector('clippy-validations-list');
      const items = listEl?.shadowRoot?.querySelectorAll('clippy-validation-item');
      expect(items?.length).toBe(3);
    });
    expect(drawerEl?.shadowRoot?.querySelector('clippy-validation-filters')).not.toHaveAttribute('hidden');
  });
});
