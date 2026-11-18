import { coreValidationRules } from '@nl-design-system-community/clippy-a11y-validator';
import { violation } from '@test/violation';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import type { Violation } from '@/types/validation';
import { CustomEvents } from '@/events';
import '@/components/content-views';
import '@/components/sidebar';
import './index';
import type { ValidationsView } from './index';

const TEST_IDENTIFIER = 'test-editor-id';

const region = () => page.getByRole('region', { name: 'Fouten, waarschuwingen of tips' });

/** Puts the view in a sidebar beside the Content views, as a Clippy hub does. */
const inSidebar = (view: ValidationsView, identifier: string) => {
  const sidebar = document.createElement('clippy-sidebar');
  const contentViews = document.createElement('clippy-content-views');
  for (const element of [sidebar, view, contentViews]) element.identifier = identifier;
  sidebar.append(view, contentViews);
  return sidebar;
};

describe('<clippy-validations-view>', () => {
  let viewElement: ValidationsView;

  beforeEach(() => {
    document.documentElement.lang = 'nl';
    viewElement = document.createElement('clippy-validations-view');
    viewElement.identifier = TEST_IDENTIFIER;
    document.body.replaceChildren(inSidebar(viewElement, TEST_IDENTIFIER));
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('opens when OPEN_DOCUMENT_OVERVIEW is dispatched for the validations of its hub', async () => {
    await expect.element(region()).not.toBeInTheDocument();

    globalThis.dispatchEvent(
      new CustomEvent(CustomEvents.OPEN_DOCUMENT_OVERVIEW, {
        detail: { identifier: TEST_IDENTIFIER, mode: 'validations' },
      }),
    );

    await expect.element(region()).toBeVisible();
  });

  it('does not open when OPEN_DOCUMENT_OVERVIEW targets another hub', async () => {
    globalThis.dispatchEvent(
      new CustomEvent(CustomEvents.OPEN_DOCUMENT_OVERVIEW, {
        detail: { identifier: 'another-editor-id', mode: 'validations' },
      }),
    );
    await viewElement.updateComplete;

    await expect.element(region()).not.toBeInTheDocument();
  });

  it('does not open for a Content view', async () => {
    globalThis.dispatchEvent(
      new CustomEvent(CustomEvents.OPEN_DOCUMENT_OVERVIEW, {
        detail: { identifier: TEST_IDENTIFIER, mode: 'link-list' },
      }),
    );
    await viewElement.updateComplete;

    await expect.element(region()).not.toBeInTheDocument();
  });

  it('closes when a Content view of its hub opens', async () => {
    const open = (mode: string) =>
      globalThis.dispatchEvent(
        new CustomEvent(CustomEvents.OPEN_DOCUMENT_OVERVIEW, { detail: { identifier: TEST_IDENTIFIER, mode } }),
      );
    open('validations');
    await expect.element(region()).toBeVisible();

    open('heading-structure');

    await expect.element(region()).not.toBeInTheDocument();
  });

  it('closes with its close button', async () => {
    globalThis.dispatchEvent(
      new CustomEvent(CustomEvents.OPEN_DOCUMENT_OVERVIEW, {
        detail: { identifier: TEST_IDENTIFIER, mode: 'validations' },
      }),
    );
    await expect.element(region()).toBeVisible();

    await userEvent.click(page.getByRole('button', { name: 'Sluiten' }));

    await expect.element(region()).not.toBeInTheDocument();
  });

  it('shows "Fouten, waarschuwingen of tips" as its heading', async () => {
    globalThis.dispatchEvent(
      new CustomEvent(CustomEvents.OPEN_DOCUMENT_OVERVIEW, {
        detail: { identifier: TEST_IDENTIFIER, mode: 'validations' },
      }),
    );

    await expect.element(page.getByRole('heading', { name: 'Fouten, waarschuwingen of tips' })).toBeVisible();
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

    // Open the view so the list is rendered
    globalThis.dispatchEvent(
      new CustomEvent(CustomEvents.OPEN_DOCUMENT_OVERVIEW, {
        detail: { identifier: TEST_IDENTIFIER, mode: 'validations' },
      }),
    );

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

  it('shows only the focused group and hides the filters on OPEN_VALIDATION_GROUP', async () => {
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

    // Open only the group of r1 + r2 (as if a gutter item with an overlap was clicked).
    globalThis.dispatchEvent(
      new CustomEvent(CustomEvents.OPEN_VALIDATION_GROUP, {
        detail: { identifier: TEST_IDENTIFIER, ranges: [r1, r2] },
      }),
    );

    const viewEl = document.querySelector('clippy-validations-view');
    await expect.element(region()).toBeVisible();

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

  const openView = (mode = 'validations') =>
    globalThis.dispatchEvent(
      new CustomEvent(CustomEvents.OPEN_DOCUMENT_OVERVIEW, { detail: { identifier: IDENTIFIER, mode } }),
    );

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
    document.body.replaceChildren(content, inSidebar(view, IDENTIFIER));
    await view.updateComplete;
  });

  afterEach(() => {
    document.body.replaceChildren();
  });

  it('has no overlay property', () => {
    expect('overlay' in view).toBe(false);
  });

  it('stays open when an item is focused', async () => {
    openView();
    await expect.element(region()).toBeVisible();

    const [range] = view.violationsMap!.keys();
    view.dispatchEvent(new CustomEvent(CustomEvents.FOCUS_NODE, { bubbles: true, composed: true, detail: { range } }));
    await view.updateComplete;

    await expect.element(region()).toBeVisible();
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
    globalThis.dispatchEvent(
      new CustomEvent(CustomEvents.OPEN_VALIDATION_GROUP, {
        detail: { identifier: IDENTIFIER, ranges: [paragraphRange] },
      }),
    );

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
