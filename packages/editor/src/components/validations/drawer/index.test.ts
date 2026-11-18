import { coreValidationRules } from '@nl-design-system-community/clippy-a11y-validator';
import { violation } from '@test/violation';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import type { Violation } from '@/types/validation';
import { CustomEvents } from '@/events';
import './index';
import type { ValidationsDrawer } from './index';

const TEST_IDENTIFIER = 'test-editor-id';

describe('<clippy-validations-dialog>', () => {
  let drawerElement: ValidationsDrawer;

  beforeEach(() => {
    document.documentElement.lang = 'nl';
    drawerElement = document.createElement('clippy-validations-drawer');
    drawerElement.identifier = TEST_IDENTIFIER;
    document.body.replaceChildren(drawerElement);
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
    await vi.waitFor(() => {
      expect(page.getByTestId('clippy-validations-drawer')).toBeInTheDocument();
    });

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

    drawerElement.violationsMap = violationsMap;
    await drawerElement.updateComplete;

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
    await vi.waitFor(() => {
      expect(page.getByTestId('clippy-validations-drawer')).toBeInTheDocument();
    });

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

    drawerElement.violationsMap = violationsMap;
    await drawerElement.updateComplete;

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

describe('<clippy-validations-drawer> on a page', () => {
  const IDENTIFIER = 'page-review-test';
  let drawer: HTMLElementTagNameMap['clippy-validations-drawer'];
  let content: HTMLElement;

  const openDrawer = (mode = 'validations') =>
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
    drawer = document.createElement('clippy-validations-drawer');
    drawer.identifier = IDENTIFIER;
    drawer.htmlDocument = content;
    drawer.violationsMap = paragraphViolationsMap();
    document.body.replaceChildren(content, drawer);
    await drawer.updateComplete;
  });

  afterEach(() => {
    document.body.replaceChildren();
  });

  it('has no overlay property', () => {
    expect('overlay' in drawer).toBe(false);
  });

  it('stays open when an item is focused', async () => {
    openDrawer();
    await expect.element(page.getByTestId('clippy-validations-drawer')).not.toHaveAttribute('hidden');

    const [range] = drawer.violationsMap!.keys();
    drawer.dispatchEvent(
      new CustomEvent(CustomEvents.FOCUS_NODE, { bubbles: true, composed: true, detail: { range } }),
    );
    await drawer.updateComplete;

    await expect.element(page.getByTestId('clippy-validations-drawer')).not.toHaveAttribute('hidden');
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
    drawer.violationsMap = violationsOn(heading, paragraph);
    await drawer.updateComplete;
    const [, paragraphRange] = drawer.violationsMap.keys();
    globalThis.dispatchEvent(
      new CustomEvent(CustomEvents.OPEN_VALIDATION_GROUP, {
        detail: { identifier: IDENTIFIER, ranges: [paragraphRange] },
      }),
    );

    drawer.violationsMap = violationsOn(heading, paragraph);

    const items = () => [
      ...(drawer.shadowRoot
        ?.querySelector('clippy-validations-list')
        ?.shadowRoot?.querySelectorAll('clippy-validation-item') ?? []),
    ];
    const renderedRanges = () => items().map((item) => item.range);
    await expect.poll(() => renderedRanges().length === 1 && renderedRanges()[0] !== paragraphRange).toBe(true);
    expect(renderedRanges()[0]?.intersectsNode(paragraph)).toBe(true);
  });

  it('announces when it opens and closes', async () => {
    const toggles: unknown[] = [];
    const record = (event: Event) => toggles.push((event as CustomEvent).detail);
    globalThis.addEventListener(CustomEvents.VALIDATIONS_DRAWER_TOGGLE, record);

    openDrawer();
    await drawer.updateComplete;
    globalThis.dispatchEvent(
      new CustomEvent(CustomEvents.CLOSE_VALIDATIONS_DRAWER, { detail: { identifier: IDENTIFIER } }),
    );
    await drawer.updateComplete;
    globalThis.removeEventListener(CustomEvents.VALIDATIONS_DRAWER_TOGGLE, record);

    expect(toggles).toEqual([
      { identifier: IDENTIFIER, open: true },
      { identifier: IDENTIFIER, open: false },
    ]);
  });
});

describe('<clippy-validations-drawer> content view tabs', () => {
  const IDENTIFIER = 'tabs-editor';

  const openOverview = (mode: string) =>
    globalThis.dispatchEvent(
      new CustomEvent(CustomEvents.OPEN_DOCUMENT_OVERVIEW, { detail: { identifier: IDENTIFIER, mode } }),
    );

  beforeEach(async () => {
    document.documentElement.lang = 'nl';
    const drawer = document.createElement('clippy-validations-drawer');
    drawer.identifier = IDENTIFIER;
    document.body.replaceChildren(drawer);
    await drawer.updateComplete;
  });

  afterEach(() => {
    document.body.replaceChildren();
  });

  it('shows a tab per content view with the opened view selected', async () => {
    openOverview('link-list');

    await vi.waitFor(() => expect(page.getByRole('tab').elements()).toHaveLength(3));
    await expect.element(page.getByRole('tab', { name: 'Kopstructuur' })).toHaveAttribute('aria-selected', 'false');
    await expect.element(page.getByRole('tab', { name: 'Links' })).toHaveAttribute('aria-selected', 'true');
    await expect.element(page.getByRole('tab', { name: 'Taalwijzigingen' })).toHaveAttribute('aria-selected', 'false');
    await expect.element(page.getByRole('tabpanel', { name: 'Links' })).toBeVisible();
  });

  it('does not show tabs for the validations', async () => {
    openOverview('validations');

    await expect.element(page.getByTestId('clippy-validations-drawer')).not.toHaveAttribute('hidden');
    await expect.element(page.getByRole('tablist')).not.toBeInTheDocument();
  });

  it('switches the content view when a tab is clicked', async () => {
    openOverview('heading-structure');

    await userEvent.click(page.getByRole('tab', { name: 'Taalwijzigingen' }));

    await expect.element(page.getByRole('tab', { name: 'Taalwijzigingen' })).toHaveAttribute('aria-selected', 'true');
    await expect.element(page.getByRole('tabpanel', { name: 'Taalwijzigingen' })).toBeVisible();
    await expect.element(page.getByRole('tabpanel', { name: 'Kopstructuur' })).not.toBeInTheDocument();
  });

  it('only keeps the selected tab in the tab sequence', async () => {
    openOverview('link-list');

    await expect.element(page.getByRole('tab', { name: 'Links' })).toHaveAttribute('tabindex', '0');
    await expect.element(page.getByRole('tab', { name: 'Kopstructuur' })).toHaveAttribute('tabindex', '-1');
  });

  it('moves between tabs with the arrow, Home and End keys', async () => {
    openOverview('heading-structure');
    const tab = (name: string) => page.getByRole('tab', { name });
    const drawer = document.querySelector('clippy-validations-drawer')!;
    const expectFocus = (name: string) =>
      vi.waitFor(() => expect(drawer.shadowRoot?.activeElement).toBe(tab(name).element()));
    await expect.element(tab('Kopstructuur')).toBeVisible();
    (tab('Kopstructuur').element() as HTMLElement).focus();

    await userEvent.keyboard('{ArrowRight}');
    await expectFocus('Links');
    await expect.element(tab('Links')).toHaveAttribute('aria-selected', 'true');

    await userEvent.keyboard('{End}');
    await expectFocus('Taalwijzigingen');

    await userEvent.keyboard('{ArrowRight}');
    await expectFocus('Kopstructuur');

    await userEvent.keyboard('{ArrowLeft}');
    await expectFocus('Taalwijzigingen');

    await userEvent.keyboard('{Home}');
    await expectFocus('Kopstructuur');
    await expect.element(tab('Kopstructuur')).toHaveAttribute('aria-selected', 'true');
  });
});
