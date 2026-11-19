import { coreValidationRules, coreValidations } from '@nl-design-system-community/clippy-a11y-validator';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Violation, ViolationsMap } from '@/types/validation';
import '@/components/toolbar/toolbar-accessibility-notifications';
import '@/components/validations/gutter';
import '@/components/validations/list';
import { CustomEvents, type DocumentOverviewMode } from '@/events';
import { DARK_COLOR_SCHEME_CLASS, THEME_CLASS } from '@/utils/colorScheme';
import { VALIDATION_HOVER_HIGHLIGHT_NAMES } from '@/utils/highlights';
import { ClippyHub } from './index';

const IDENTIFIER = 'clippy-hub-test';

let target: HTMLElement;
let hub: ClippyHub | undefined;

const rulesIn = (map: ViolationsMap | undefined): string[] => [...(map?.values() ?? [])].map(({ rule }) => rule);

const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));

const createTrigger = () => document.body.appendChild(document.createElement('clippy-accessibility-notifications'));

beforeEach(() => {
  document.documentElement.lang = 'nl';
  target = document.createElement('div');
  document.body.replaceChildren(target);
});

afterEach(() => {
  vi.useRealTimers();
  hub?.destroy();
  hub = undefined;
  document.body.replaceChildren();
});

describe('ClippyHub', () => {
  it('validates only the target element and pushes the violations to the connected trigger', async () => {
    target.innerHTML = '<h1>Titel</h1><p></p>';
    document.body.append(document.createElement('h3'));
    const trigger = createTrigger();

    hub = new ClippyHub({ identifier: IDENTIFIER, target });
    hub.connect({ trigger });
    await hub.validate();

    expect(trigger.identifier).toBe(IDENTIFIER);
    expect(rulesIn(trigger.violationsMap)).toEqual([coreValidationRules.PARAGRAPH_SHOULD_NOT_BE_EMPTY]);
  });

  it('feeds its sidebar views and the gutter the same violations, target and identifier', async () => {
    target.innerHTML = '<h1>Titel</h1><p></p>';
    const gutter = document.body.appendChild(document.createElement('clippy-validations-gutter'));

    hub = new ClippyHub({ identifier: IDENTIFIER, target });
    const validationsView = hub.validationsView!;
    const contentViews = hub.contentViews!;
    hub.connect({ gutter });
    await hub.validate();

    expect(validationsView.identifier).toBe(IDENTIFIER);
    expect(contentViews.identifier).toBe(IDENTIFIER);
    expect(gutter.identifier).toBe(IDENTIFIER);
    expect(contentViews.htmlDocument).toBe(target);
    expect(rulesIn(validationsView.violationsMap)).toEqual([coreValidationRules.PARAGRAPH_SHOULD_NOT_BE_EMPTY]);
    expect(gutter.violationsMap).toBe(validationsView.violationsMap);
    expect(contentViews.violationsMap).toBe(validationsView.violationsMap);
  });

  it('feeds a connected validations list the violations and identifier', async () => {
    target.innerHTML = '<h1>Titel</h1><p></p>';
    const list = document.body.appendChild(document.createElement('clippy-validations-list'));

    hub = new ClippyHub({ identifier: IDENTIFIER, target });
    hub.connect({ list });
    await hub.validate();

    expect(list.identifier).toBe(IDENTIFIER);
    expect(rulesIn(list.violationsMap)).toEqual([coreValidationRules.PARAGRAPH_SHOULD_NOT_BE_EMPTY]);
  });

  it('gives a view connected after a validation the latest violations', async () => {
    target.innerHTML = '<h1>Titel</h1><p></p>';
    hub = new ClippyHub({ identifier: IDENTIFIER, target });
    await hub.validate();

    const trigger = createTrigger();
    hub.connect({ trigger });

    expect(rulesIn(trigger.violationsMap)).toEqual([coreValidationRules.PARAGRAPH_SHOULD_NOT_BE_EMPTY]);
  });

  it('lets the host adapt the violations before they reach the views', async () => {
    target.innerHTML = '<h1>Titel</h1><p></p>';
    const trigger = createTrigger();

    hub = new ClippyHub({ adaptViolations: () => new Map(), identifier: IDENTIFIER, target });
    hub.connect({ trigger });
    await hub.validate();

    expect(trigger.violationsMap?.size).toBe(0);
  });

  it('waits for media inside the target to settle before validating', async () => {
    target.innerHTML = '<h1>Titel</h1><video></video><p></p>';
    const trigger = createTrigger();
    hub = new ClippyHub({ identifier: IDENTIFIER, target });
    hub.connect({ trigger });

    const validated = hub.validate();
    await nextFrame();
    expect(trigger.violationsMap).toBeUndefined();

    target.querySelector('video')?.dispatchEvent(new Event('loadedmetadata'));
    await validated;
    expect(rulesIn(trigger.violationsMap)).toContain(coreValidationRules.PARAGRAPH_SHOULD_NOT_BE_EMPTY);
  });

  it('stops waiting for media that never settles', async () => {
    vi.useFakeTimers();
    target.innerHTML = '<h1>Titel</h1><video></video><p></p>';
    const trigger = createTrigger();
    hub = new ClippyHub({ identifier: IDENTIFIER, target });
    hub.connect({ trigger });

    const validated = hub.validate();
    await vi.advanceTimersByTimeAsync(10_000);
    await validated;

    expect(rulesIn(trigger.violationsMap)).toContain(coreValidationRules.PARAGRAPH_SHOULD_NOT_BE_EMPTY);
  });

  it('stops pushing results once destroyed', async () => {
    target.innerHTML = '<h1>Titel</h1><p></p>';
    const trigger = createTrigger();
    hub = new ClippyHub({ identifier: IDENTIFIER, target });
    hub.connect({ trigger });

    hub.destroy();
    await hub.validate();

    expect(trigger.violationsMap).toBeUndefined();
  });

  it('validates with a set of validations assigned after it was created', async () => {
    target.innerHTML = '<h1>Titel</h1><p></p><h3>Sub</h3>';
    const trigger = createTrigger();
    hub = new ClippyHub({
      identifier: IDENTIFIER,
      target,
      validations: [coreValidations.PARAGRAPH_SHOULD_NOT_BE_EMPTY],
    });
    hub.connect({ trigger });
    await hub.validate();

    hub.validations = [coreValidations.HEADING_LEVEL_MUST_NOT_SKIP];
    await hub.validate();

    expect(rulesIn(trigger.violationsMap)).toEqual([coreValidationRules.HEADING_LEVEL_MUST_NOT_SKIP]);
  });

  it('re-validates the target after a correction is applied to it', async () => {
    target.innerHTML = '<h1>Titel</h1><p></p>';
    const trigger = createTrigger();
    hub = new ClippyHub({ identifier: IDENTIFIER, target });
    hub.connect({ trigger });
    await hub.validate();
    expect(trigger.violationsMap?.size).toBe(1);

    globalThis.dispatchEvent(
      new CustomEvent(CustomEvents.CORRECT_VALIDATION_ISSUE, { detail: { identifier: IDENTIFIER } }),
    );
    target.querySelector('p')?.remove();

    await expect.poll(() => trigger.violationsMap?.size).toBe(0);
  });

  it('rejects a second hub with an identifier that is already in use', () => {
    hub = new ClippyHub({ identifier: IDENTIFIER, target });

    expect(() => new ClippyHub({ identifier: IDENTIFIER, target })).toThrow(IDENTIFIER);
  });

  it('frees its identifier once destroyed', () => {
    new ClippyHub({ identifier: IDENTIFIER, target }).destroy();

    expect(() => (hub = new ClippyHub({ identifier: IDENTIFIER, target }))).not.toThrow();
  });
});

describe('ClippyHub sidebar', () => {
  const openValidations = () =>
    globalThis.dispatchEvent(
      new CustomEvent(CustomEvents.OPEN_DOCUMENT_OVERVIEW, { detail: { identifier: IDENTIFIER, mode: 'validations' } }),
    );

  const themeScope = ({ dark }: { dark: boolean }) => {
    const scope = document.body.appendChild(document.createElement('div'));
    scope.classList.add(THEME_CLASS);
    scope.classList.toggle(DARK_COLOR_SCHEME_CLASS, dark);
    return scope;
  };

  it('docks a themed sidebar with the validations view and Content views in <body>, and removes it once destroyed', () => {
    hub = new ClippyHub({ identifier: IDENTIFIER, target });
    const { contentViews, sidebar, validationsView } = hub;

    expect(sidebar?.parentElement).toBe(document.body);
    expect(sidebar?.classList.contains(THEME_CLASS)).toBe(true);
    expect([...(sidebar?.children ?? [])]).toEqual([validationsView, contentViews]);
    for (const element of [sidebar, validationsView, contentViews]) {
      expect(element?.identifier).toBe(IDENTIFIER);
    }

    hub.destroy();

    expect(sidebar?.isConnected).toBe(false);
  });

  it('gives the page width back when destroyed while its sidebar is open', async () => {
    target.innerHTML = '<h1>Titel</h1><p></p>';
    hub = new ClippyHub({ identifier: IDENTIFIER, target });
    await hub.validate();
    openValidations();
    await expect.poll(() => document.documentElement.style.marginInlineEnd).not.toBe('');

    hub.destroy();

    expect(document.documentElement.style.marginInlineEnd).toBe('');
  });

  it('follows the color scheme around the target, and switches with it', async () => {
    const scope = themeScope({ dark: true });
    scope.append(target);
    hub = new ClippyHub({ identifier: IDENTIFIER, target });

    expect(hub.sidebar?.classList.contains(DARK_COLOR_SCHEME_CLASS)).toBe(true);

    scope.classList.remove(DARK_COLOR_SCHEME_CLASS);

    await expect.poll(() => hub?.sidebar?.classList.contains(DARK_COLOR_SCHEME_CLASS)).toBe(false);
  });

  it('follows the color scheme around colorSchemeElement when one is given', () => {
    themeScope({ dark: false }).append(target);
    const colorSchemeElement = themeScope({ dark: true }).appendChild(document.createElement('div'));

    hub = new ClippyHub({ colorSchemeElement, identifier: IDENTIFIER, target });

    expect(hub.sidebar?.classList.contains(DARK_COLOR_SCHEME_CLASS)).toBe(true);
  });

  it('docks no sidebar when createSidebar is false', () => {
    hub = new ClippyHub({ createSidebar: false, identifier: IDENTIFIER, target });

    expect(hub.sidebar).toBeNull();
    expect(hub.validationsView).toBeNull();
    expect(hub.contentViews).toBeNull();
    expect(document.querySelector('clippy-sidebar')).toBeNull();
  });
});

describe('Multiple ClippyHub sidebars on one page', () => {
  const OTHER_IDENTIFIER = 'clippy-hub-test-other';
  let otherHub: ClippyHub | undefined;

  afterEach(() => {
    otherHub?.destroy();
    otherHub = undefined;
  });

  const openValidationsOf = (identifier: string) =>
    globalThis.dispatchEvent(
      new CustomEvent(CustomEvents.OPEN_DOCUMENT_OVERVIEW, { detail: { identifier, mode: 'validations' } }),
    );

  it('closes the open sidebar of another hub when its own sidebar opens, reserving the width of one sidebar', async () => {
    target.innerHTML = '<h1>Titel</h1><p></p>';
    const otherTarget = document.body.appendChild(document.createElement('div'));
    otherTarget.innerHTML = '<h1>Titel</h1><p></p>';
    hub = new ClippyHub({ identifier: IDENTIFIER, target });
    otherHub = new ClippyHub({ identifier: OTHER_IDENTIFIER, target: otherTarget });
    const sidebar = hub.sidebar!;
    const otherSidebar = otherHub.sidebar!;
    await Promise.all([hub.validate(), otherHub.validate()]);

    openValidationsOf(IDENTIFIER);
    await expect.poll(() => sidebar.hasAttribute('open')).toBe(true);

    openValidationsOf(OTHER_IDENTIFIER);
    await expect.poll(() => otherSidebar.hasAttribute('open')).toBe(true);
    await expect.poll(() => sidebar.hasAttribute('open')).toBe(false);

    const { width } = otherSidebar.getBoundingClientRect();
    expect(width).toBeGreaterThan(0);
    expect(document.documentElement.style.marginInlineEnd).toBe(`${width}px`);
  });
});

describe('ClippyHub sidebar session', () => {
  const openValidations = () =>
    globalThis.dispatchEvent(
      new CustomEvent(CustomEvents.OPEN_DOCUMENT_OVERVIEW, { detail: { identifier: IDENTIFIER, mode: 'validations' } }),
    );

  const closeSidebar = () =>
    globalThis.dispatchEvent(new CustomEvent(CustomEvents.CLOSE_SIDEBAR, { detail: { identifier: IDENTIFIER } }));

  const focusButtons = (view: Element) =>
    [
      ...(view.shadowRoot
        ?.querySelector('clippy-validations-list')
        ?.shadowRoot?.querySelectorAll('clippy-validation-item') ?? []),
    ].map((item) =>
      item.shadowRoot?.querySelector('clippy-button[purpose="secondary"]')?.shadowRoot?.querySelector('button'),
    );

  const highlightedText = () =>
    Object.values(VALIDATION_HOVER_HIGHLIGHT_NAMES).flatMap((name) =>
      [...(CSS.highlights.get(name)?.keys() ?? [])].map((range) => range.toString()),
    );

  it('re-validates the target when a sidebar opens', async () => {
    target.innerHTML = '<h1>Titel</h1><p></p>';
    const trigger = createTrigger();
    hub = new ClippyHub({ identifier: IDENTIFIER, target });
    hub.connect({ trigger });
    await hub.validate();
    expect(trigger.violationsMap?.size).toBe(1);

    target.append(document.createElement('p'));
    openValidations();

    await expect.poll(() => trigger.violationsMap?.size).toBe(2);
  });

  it('moves focus into a sidebar when it opens, and back to the trigger when it closes', async () => {
    target.innerHTML = '<h1>Titel</h1><p></p>';
    const trigger = createTrigger();
    hub = new ClippyHub({ identifier: IDENTIFIER, target });
    const validationsView = hub.validationsView!;
    hub.connect({ trigger });
    await hub.validate();

    openValidations();
    await expect.poll(() => document.activeElement).toBe(validationsView);

    closeSidebar();
    await expect.poll(() => document.activeElement).toBe(trigger);
  });

  it('moves focus to the sidebar that replaces an open one', async () => {
    target.innerHTML = '<h1>Titel</h1><p></p>';
    hub = new ClippyHub({ identifier: IDENTIFIER, target });
    const validationsView = hub.validationsView!;
    const contentViews = hub.contentViews!;
    hub.connect({ trigger: createTrigger() });
    await hub.validate();
    openValidations();
    await expect.poll(() => document.activeElement).toBe(validationsView);

    globalThis.dispatchEvent(
      new CustomEvent(CustomEvents.OPEN_DOCUMENT_OVERVIEW, { detail: { identifier: IDENTIFIER, mode: 'link-list' } }),
    );

    await expect.poll(() => document.activeElement).toBe(contentViews);
    expect(validationsView.open).toBe(false);
  });

  it('moves focus back to the trigger when Escape closes a sidebar', async () => {
    target.innerHTML = '<h1>Titel</h1><p></p>';
    const trigger = createTrigger();
    hub = new ClippyHub({ identifier: IDENTIFIER, target });
    const validationsView = hub.validationsView!;
    hub.connect({ trigger });
    await hub.validate();

    openValidations();
    await expect.poll(() => document.activeElement).toBe(validationsView);
    validationsView.shadowRoot
      ?.querySelector('.clippy-validations-view__title')
      ?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, composed: true, key: 'Escape' }));

    await expect.poll(() => validationsView.open).toBe(false);
    await expect.poll(() => document.activeElement).toBe(trigger);
  });

  it('moves focus back to the trigger when the close button closes a sidebar', async () => {
    target.innerHTML = '<h1>Titel</h1><p></p>';
    const trigger = createTrigger();
    hub = new ClippyHub({ identifier: IDENTIFIER, target });
    const validationsView = hub.validationsView!;
    hub.connect({ trigger });
    await hub.validate();

    openValidations();
    await expect.poll(() => document.activeElement).toBe(validationsView);
    hub.sidebar?.shadowRoot
      ?.querySelector('.clippy-sidebar__close-button')
      ?.shadowRoot?.querySelector('button')
      ?.click();

    await expect.poll(() => validationsView.open).toBe(false);
    await expect.poll(() => document.activeElement).toBe(trigger);
  });

  it('keeps the validations view open and hands the violation of a picked item to focusViolation', async () => {
    target.innerHTML = '<h1>Titel</h1><p></p>';
    const focused: Violation[] = [];
    hub = new ClippyHub({ focusViolation: (violation) => focused.push(violation), identifier: IDENTIFIER, target });
    const validationsView = hub.validationsView!;
    await hub.validate();

    openValidations();
    await expect.poll(() => focusButtons(validationsView).length).toBe(1);
    focusButtons(validationsView)[0]?.click();
    await validationsView.updateComplete;

    expect(focused.map(({ element }) => element)).toEqual([target.querySelector('p')]);
    expect(validationsView.open).toBe(true);
  });

  it('scrolls a focused violation into view by default, without highlighting it', async () => {
    target.innerHTML = '<h1>Titel</h1><div style="block-size: 300vh"></div><h3>Overgeslagen</h3>';
    const heading = target.querySelector('h3')!;
    hub = new ClippyHub({ identifier: IDENTIFIER, target });
    const validationsView = hub.validationsView!;
    await hub.validate();

    openValidations();
    await expect.poll(() => focusButtons(validationsView).length).toBe(1);
    focusButtons(validationsView)[0]?.click();

    await expect.poll(() => heading.getBoundingClientRect().bottom <= window.innerHeight).toBe(true);
    expect(highlightedText()).toEqual([]);
  });
});

describe('ClippyHub views without a context provider', () => {
  const openOverview = (mode: DocumentOverviewMode) =>
    globalThis.dispatchEvent(
      new CustomEvent(CustomEvents.OPEN_DOCUMENT_OVERVIEW, { detail: { identifier: IDENTIFIER, mode } }),
    );

  const inContentViews = <K extends keyof HTMLElementTagNameMap>(contentViews: Element, tag: K) =>
    contentViews.shadowRoot!.querySelector(tag)!;

  const textsOf = (element: Element, selector: string) =>
    [...(element.shadowRoot?.querySelectorAll(selector) ?? [])].map(({ textContent }) => textContent?.trim());

  it('shows the heading structure, links and language changes of the validated element', async () => {
    target.innerHTML = '<h1>Titel</h1><h2>Sectie</h2><p><a href="/contact">Contact</a></p><p lang="en">Hello</p>';
    document.body.append(Object.assign(document.createElement('h3'), { textContent: 'Buiten' }));
    hub = new ClippyHub({ identifier: IDENTIFIER, target });
    const contentViews = hub.contentViews!;
    await hub.validate();

    openOverview('heading-structure');
    await expect
      .poll(() => textsOf(inContentViews(contentViews, 'clippy-heading-structure'), '.clippy-heading-structure__text'))
      .toEqual(['Titel', 'Sectie']);

    openOverview('link-list');
    await expect
      .poll(() => textsOf(inContentViews(contentViews, 'clippy-link-list'), '.clippy-link-list__item a'))
      .toEqual(['Contact']);

    openOverview('language-changes');
    await expect.poll(() => textsOf(inContentViews(contentViews, 'clippy-language-changes'), 'a')).toContain('Hello');
  });

  it('scrolls the element picked in a Content view into view inside the validated element', async () => {
    target.innerHTML = '<h1>Titel</h1><div style="block-size: 300vh"></div><h2>Verderop</h2>';
    const heading = target.querySelector('h2')!;
    hub = new ClippyHub({ identifier: IDENTIFIER, target });
    const contentViews = hub.contentViews!;
    await hub.validate();

    openOverview('heading-structure');
    const headingStructure = inContentViews(contentViews, 'clippy-heading-structure');
    await expect.poll(() => headingStructure.shadowRoot?.querySelectorAll('button').length).toBe(2);
    headingStructure.shadowRoot!.querySelectorAll('button')[1].click();

    await expect.poll(() => heading.getBoundingClientRect().top < window.innerHeight).toBe(true);
  });
});
