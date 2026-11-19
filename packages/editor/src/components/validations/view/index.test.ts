import { coreValidationRules } from '@nl-design-system-community/clippy-a11y-validator';
import { violation } from '@test/violation';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Violation } from '@/types/validation';
import './index';
import type { ValidationsView } from './index';

const TEST_IDENTIFIER = 'test-editor-id';

describe('<clippy-validations-view>', () => {
  let viewElement: ValidationsView;

  beforeEach(() => {
    document.documentElement.lang = 'nl';
    viewElement = document.createElement('clippy-validations-view');
    viewElement.identifier = TEST_IDENTIFIER;
    document.body.replaceChildren(viewElement);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders large validations map with all validation items', async () => {
    /** Helper: create a Violation keyed by a fresh Range. */
    const entry = (
      rule: string,
      severity: Violation['severity'],
      payload?: Violation['payload'],
    ): [Range, Violation] => {
      const range = document.createRange();
      return [range, violation({ payload, range, rule, severity })];
    };

    const violationsMap: Map<Range, Violation> = new Map([
      entry(coreValidationRules.HEADING_MUST_NOT_BE_EMPTY, 'error'),
      entry(coreValidationRules.IMAGE_MUST_HAVE_ALT_TEXT, 'error'),
      entry(coreValidationRules.LINK_SHOULD_NOT_BE_TOO_GENERIC, 'warning'),
      entry(coreValidationRules.PARAGRAPH_SHOULD_NOT_BE_EMPTY, 'warning'),
      entry(coreValidationRules.PARAGRAPH_SHOULD_NOT_CONTAIN_EMPTY_FORMATTING, 'error', { tag: 'b' }),
      entry(coreValidationRules.HEADING_LEVEL_MUST_NOT_SKIP, 'error', {
        expectedHeadingLevel: 2,
        headingLevel: 3,
        precedingHeadingLevel: 1,
      }),
      entry(coreValidationRules.PARAGRAPH_SHOULD_NOT_RESEMBLE_LIST, 'warning', { prefix: '-' }),
      entry(coreValidationRules.HEADING_SHOULD_NOT_CONTAIN_BOLD_OR_ITALIC, 'warning'),
      entry(coreValidationRules.PARAGRAPH_SHOULD_NOT_CONTAIN_UNDERLINED_TEXT, 'warning'),
      entry('HEADING_MUST_START_AT_LEVEL_ONE', 'error'),
    ]);

    viewElement.violationsMap = violationsMap;
    await viewElement.updateComplete;

    const viewEl = document.querySelector('clippy-validations-view');

    await vi.waitFor(() => {
      const listEl = viewEl?.shadowRoot?.querySelector('clippy-validations-list');
      const items = listEl?.shadowRoot?.querySelectorAll('clippy-validation-item');
      expect(items?.length).toBe(10);
    });

    const listEl = viewEl?.shadowRoot?.querySelector('clippy-validations-list');
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

  it('shows only the focused group and hides the filters', async () => {
    const [r1, r2, r3] = ['h1', 'a', 'img'].map((tagName) => {
      const element = document.createElement(tagName);
      document.body.append(element);
      const range = document.createRange();
      range.selectNode(element);
      return range;
    });
    const violationsMap: Map<Range, Violation> = new Map([
      [r1, violation({ range: r1, rule: coreValidationRules.HEADING_MUST_NOT_BE_EMPTY, severity: 'error' })],
      [r2, violation({ range: r2, rule: coreValidationRules.LINK_SHOULD_NOT_BE_TOO_GENERIC, severity: 'warning' })],
      [r3, violation({ range: r3, rule: coreValidationRules.IMAGE_MUST_HAVE_ALT_TEXT, severity: 'error' })],
    ]);

    viewElement.violationsMap = violationsMap;
    await viewElement.updateComplete;

    // Show only the group of r1 + r2 (as if a gutter item with an overlap was clicked).
    viewElement.focusedValidationGroup = [r1, r2];

    const viewEl = document.querySelector('clippy-validations-view');

    // Only the two focused validations are rendered, not the third.
    await vi.waitFor(() => {
      const listEl = viewEl?.shadowRoot?.querySelector('clippy-validations-list');
      const items = listEl?.shadowRoot?.querySelectorAll('clippy-validation-item');
      expect(items?.length).toBe(2);
    });

    // The severity filters are hidden while a group is focused.
    const filters = viewEl?.shadowRoot?.querySelector('clippy-validation-filters');
    expect(filters).toHaveAttribute('hidden');

    // Clicking "Show all validations" clears the group and reveals every item + the filters.
    const showAll = viewEl?.shadowRoot?.querySelector('.clippy-validations-view__show-all');
    (showAll as HTMLElement | null)?.click();

    await vi.waitFor(() => {
      const listEl = viewEl?.shadowRoot?.querySelector('clippy-validations-list');
      const items = listEl?.shadowRoot?.querySelectorAll('clippy-validation-item');
      expect(items?.length).toBe(3);
    });
    expect(viewEl?.shadowRoot?.querySelector('clippy-validation-filters')).not.toHaveAttribute('hidden');
  });
});

describe('<clippy-validations-view> on a page', () => {
  const IDENTIFIER = 'page-review-test';
  let view: HTMLElementTagNameMap['clippy-validations-view'];
  let content: HTMLElement;

  const paragraphViolationsMap = (): Map<Range, Violation> => {
    const range = document.createRange();
    range.selectNode(content.querySelector('p')!);
    return new Map([[range, violation({ range })]]);
  };

  beforeEach(async () => {
    document.documentElement.lang = 'nl';
    content = document.createElement('main');
    content.innerHTML = '<h1>Titel</h1><p></p>';
    view = document.createElement('clippy-validations-view');
    view.identifier = IDENTIFIER;
    view.violationsMap = paragraphViolationsMap();
    document.body.replaceChildren(content, view);
    await view.updateComplete;
  });

  afterEach(() => {
    document.body.replaceChildren();
  });

  it('keeps showing the opened group when re-validation creates new ranges', async () => {
    const violationsOn = (...elements: Element[]): Map<Range, Violation> =>
      new Map(
        elements.map((element) => {
          const range = document.createRange();
          range.selectNode(element);
          return [range, violation({ range })];
        }),
      );
    const heading = content.querySelector('h1')!;
    const paragraph = content.querySelector('p')!;
    view.violationsMap = violationsOn(heading, paragraph);
    await view.updateComplete;
    const [, paragraphRange] = view.violationsMap.keys();
    view.focusedValidationGroup = [paragraphRange];

    view.violationsMap = violationsOn(heading, paragraph);

    const items = () => [
      ...(view.shadowRoot
        ?.querySelector('clippy-validations-list')
        ?.shadowRoot?.querySelectorAll('clippy-validation-item') ?? []),
    ];
    const renderedRanges = () => items().map((item) => item.range);
    await expect.poll(() => renderedRanges().length === 1 && renderedRanges()[0] !== paragraphRange).toBe(true);
    expect(renderedRanges()[0]?.intersectsNode(paragraph)).toBe(true);
  });
});
