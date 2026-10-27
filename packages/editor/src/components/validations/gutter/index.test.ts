import { coreValidationRules, type ValidationSeverity } from '@nl-design-system-community/clippy-a11y-validator';
import { inlineViolation, violation } from '@test/violation';
import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import { page } from 'vitest/browser';
import type { ViolationsMap } from '@/types/validation';
import { validationInteractionMode } from '@/constants';
import { CustomEvents, type OpenValidationGroupEvent } from '@/events';
import { VALIDATION_HOVER_HIGHLIGHT_NAMES } from '@/utils/highlights';
import type { Gutter } from './index';
import './index';

/** Build a Range that has a non-zero bounding rect, so the gutter renders an indicator for it. */
const rangeOver = (element: Element): Range => {
  const range = document.createRange();
  range.selectNodeContents(element);
  return range;
};

/**
 * Render a paragraph with a gutter over it. Drawer mode without a
 * `<clippy-context>` ancestor mirrors the CKEditor setup, where the identifier
 * can only reach the drawer through the prop.
 */
const renderGutter = (markup: string) => {
  const content = document.createElement('p');
  content.innerHTML = markup;
  document.body.append(content);

  const gutter = document.createElement('clippy-validations-gutter') as Gutter;
  gutter.mode = validationInteractionMode.DRAWER;
  gutter.identifier = 'clippy-editor-1';
  document.body.append(gutter);

  return { content, gutter };
};

const validate = async (gutter: Gutter, validations: ViolationsMap): Promise<void> => {
  gutter.violationsMap = validations;
  await gutter.updateComplete;
};

/** Click the button and return the validations the drawer is asked to open. */
const openedBy = async (name: string | RegExp): Promise<OpenValidationGroupEvent['detail']> => {
  const opened: OpenValidationGroupEvent[] = [];
  const listener = (event: Event) => opened.push(event as OpenValidationGroupEvent);
  globalThis.addEventListener(CustomEvents.OPEN_VALIDATION_GROUP, listener);
  await page.getByRole('button', { name }).click();
  globalThis.removeEventListener(CustomEvents.OPEN_VALIDATION_GROUP, listener);

  expect(opened).toHaveLength(1);
  return opened[0].detail;
};

const BOLD_PARAGRAPH_HEADING = 'De hele alinea is dikgedrukt.';
const GENERIC_LINK_HEADING = 'De linktekst "lees meer" zegt niet waar de link naartoe gaat.';

/** An entirely-bold paragraph violation, named after the copy the validator package ships. */
const boldParagraph = (severity: ValidationSeverity = 'warning') =>
  violation({
    messages: { title: BOLD_PARAGRAPH_HEADING },
    rule: coreValidationRules.PARAGRAPH_SHOULD_NOT_BE_ENTIRELY_BOLD,
    severity,
  });

describe('<clippy-validations-gutter>', () => {
  let rootClasses = '';

  beforeEach(() => {
    // The indicators are laid out with `--basis-*` tokens, which are scoped to
    // `.ma-theme`. Without the theme the icon button loses its inline offset and
    // covers the indicator, so mirror the class list the editor ships with.
    rootClasses = document.documentElement.className;
    document.documentElement.className = 'ma-theme clippy-theme utrecht-root';
  });

  afterEach(() => {
    document.documentElement.className = rootClasses;
    document.body.innerHTML = '';
    CSS.highlights.clear();
  });

  it('names the indicator after the message of the validation', async () => {
    const { content, gutter } = renderGutter('Deze hele alinea is dikgedrukt.');
    await validate(gutter, new Map([[rangeOver(content), boldParagraph()]]));

    await expect.element(page.getByRole('button', { name: BOLD_PARAGRAPH_HEADING })).toBeInTheDocument();
  });

  it('opens the validation it names, for the editor it belongs to', async () => {
    const { content, gutter } = renderGutter('Deze hele alinea is dikgedrukt.');
    const range = rangeOver(content);
    await validate(gutter, new Map([[range, boldParagraph()]]));

    const detail = await openedBy(BOLD_PARAGRAPH_HEADING);
    expect(detail.identifier).toBe('clippy-editor-1');
    expect(detail.ranges).toEqual([range]);
  });

  it('offers a single button per line, naming how many validations it opens', async () => {
    const { content, gutter } = renderGutter('Deze <u>alinea</u> is dikgedrukt.');
    await validate(
      gutter,
      new Map([
        [
          rangeOver(content.querySelector('u')!),
          violation({
            element: content.querySelector('u')!,
            messages: { title: 'Deze tekst is onderstreept. Dat lijkt te veel op een link.' },
            rule: coreValidationRules.PARAGRAPH_SHOULD_NOT_CONTAIN_UNDERLINED_TEXT,
            severity: 'info',
          }),
        ],
        [rangeOver(content), boldParagraph()],
      ]),
    );

    const buttons = page.getByRole('button', { name: /validations on this line/ });
    expect(buttons.elements()).toHaveLength(1);
    await expect.element(buttons).toHaveAccessibleName('Open 2 validations on this line');

    const detail = await openedBy(/validations on this line/);
    expect(detail.ranges).toHaveLength(2);
  });

  it('names the button for a lone validation without a count', async () => {
    const { content, gutter } = renderGutter('Deze hele alinea is dikgedrukt.');
    await validate(gutter, new Map([[rangeOver(content), boldParagraph('error')]]));

    await expect.element(page.getByRole('button', { name: 'Open validation' })).toBeInTheDocument();
    expect(page.getByRole('button', { name: /validations on this line/ }).query()).toBeNull();
  });

  it('keeps its buttons out of the tab order when not tabbable', async () => {
    const { content, gutter } = renderGutter('Deze hele alinea is dikgedrukt.');
    gutter.tabbable = false;
    await validate(gutter, new Map([[rangeOver(content), boldParagraph()]]));

    const buttons = [...gutter.shadowRoot!.querySelectorAll('button')];
    expect(buttons).toHaveLength(2);
    expect(buttons.map(({ tabIndex }) => tabIndex)).toEqual([-1, -1]);
    await expect.element(page.getByRole('button', { name: BOLD_PARAGRAPH_HEADING })).toBeInTheDocument();
  });

  it('emphasises the validated text while the indicator is hovered', async () => {
    const { content, gutter } = renderGutter('Ga naar <a href="#">lees meer</a>.');
    const range = rangeOver(content.querySelector('a')!);
    await validate(
      gutter,
      new Map([
        [
          range,
          inlineViolation({
            element: content.querySelector('a')!,
            messages: { title: GENERIC_LINK_HEADING },
            rule: coreValidationRules.LINK_SHOULD_NOT_BE_TOO_GENERIC,
            severity: 'info',
          }),
        ],
      ]),
    );

    const indicator = page.getByRole('button', { name: GENERIC_LINK_HEADING });
    await indicator.hover();
    const hovered = CSS.highlights.get(VALIDATION_HOVER_HIGHLIGHT_NAMES.info);
    expect(hovered && [...hovered]).toEqual([range]);

    await indicator.unhover();
    expect(CSS.highlights.has(VALIDATION_HOVER_HIGHLIGHT_NAMES.info)).toBe(false);
  });

  describe('overlay', () => {
    const indicators = (gutter: Gutter) => [
      ...gutter.shadowRoot!.querySelectorAll<HTMLElement>('.clippy-validations-gutter__indicator'),
    ];

    const rail = (indicator: HTMLElement) => indicator.querySelector('button')!.getBoundingClientRect();

    const indicatorFor = (gutter: Gutter, element: Element) =>
      indicators(gutter).find(
        (indicator) => Math.abs(indicator.getBoundingClientRect().top - element.getBoundingClientRect().top) < 1,
      );

    const renderOverlay = async (markup: string, contentSelector = 'main') => {
      document.body.innerHTML = markup;
      const content = document.querySelector<HTMLElement>(contentSelector)!;
      const heading = document.querySelector('h3')!;
      const gutter = document.createElement('clippy-validations-gutter') as Gutter;
      gutter.overlay = true;
      gutter.contentElement = content;
      content.append(gutter);
      const range = document.createRange();
      range.selectNode(heading);
      await validate(gutter, new Map([[range, violation({ element: heading })]]));
      return { content, gutter, heading };
    };

    afterEach(() => {
      document.body.removeAttribute('style');
    });

    it('lines indicators up with the offending elements in centred content', async () => {
      const { content, gutter, heading } = await renderOverlay(
        '<main style="max-inline-size: 30rem; margin-inline: auto"><h1>Titel</h1><p>Tekst</p><h3>Overgeslagen</h3></main>',
      );

      const indicator = indicators(gutter)[0].getBoundingClientRect();
      expect(indicator.top).toBeCloseTo(heading.getBoundingClientRect().top, 0);
      expect(indicator.height).toBeCloseTo(heading.getBoundingClientRect().height, 0);
      expect(rail(indicators(gutter)[0]).right).toBeCloseTo(content.getBoundingClientRect().left, 0);
    });

    it('realigns indicators when the content changes size or moves', async () => {
      const { content, gutter, heading } = await renderOverlay(
        '<div id="banner"></div><main style="max-inline-size: 30rem; margin-inline: auto"><h1>Titel</h1><h3>Overgeslagen</h3></main>',
      );

      document.querySelector<HTMLElement>('#banner')!.style.blockSize = '200px';
      content.style.maxInlineSize = '20rem';
      document.querySelector('h1')!.style.marginBlockEnd = '100px';

      await expect.poll(() => indicatorFor(gutter, heading)).toBeDefined();
      await expect
        .poll(() => rail(indicatorFor(gutter, heading)!).right)
        .toBeCloseTo(content.getBoundingClientRect().left, 0);
    });
  });
});
