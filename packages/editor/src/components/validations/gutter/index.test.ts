import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import { page } from 'vitest/browser';
import type { ValidationsMap } from '@/types/validation';
import { validationInteractionMode, validations } from '@/constants';
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

const validate = async (gutter: Gutter, validations: ValidationsMap): Promise<void> => {
  gutter.validationsMap = validations;
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
    document.documentElement.lang = '';
    document.body.innerHTML = '';
    CSS.highlights.clear();
  });

  it('names the indicator after the validation, without the markdown license comment', async () => {
    // The NL Design System snippet this covers is Dutch-language, so it only
    // appears in the Dutch catalogue.
    document.documentElement.lang = 'nl';
    const { content, gutter } = renderGutter('Deze hele alinea is dikgedrukt.');
    await validate(
      gutter,
      new Map([
        [rangeOver(content), { severity: 'warning', validatorKey: validations.PARAGRAPH_SHOULD_NOT_BE_ENTIRELY_BOLD }],
      ]),
    );

    await expect.element(page.getByRole('button', { name: BOLD_PARAGRAPH_HEADING })).toBeInTheDocument();

    // The imported editor-error.md ships with a `<!-- @license -->` comment that
    // is stripped before rendering, so it may reach neither the name nor the DOM.
    expect(page.getByRole('button', { name: /@license/ }).query()).toBeNull();
    expect(gutter.shadowRoot?.innerHTML).not.toContain('@license');
  });

  it('opens the validation it names, for the editor it belongs to', async () => {
    document.documentElement.lang = 'nl';
    const { content, gutter } = renderGutter('Deze hele alinea is dikgedrukt.');
    const range = rangeOver(content);
    await validate(
      gutter,
      new Map([[range, { severity: 'warning', validatorKey: validations.PARAGRAPH_SHOULD_NOT_BE_ENTIRELY_BOLD }]]),
    );

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
          { scope: 'inline', severity: 'info', validatorKey: validations.INLINE_SHOULD_NOT_BE_UNDERLINED },
        ],
        [
          rangeOver(content),
          {
            scope: 'block',
            severity: 'warning',
            validatorKey: validations.PARAGRAPH_SHOULD_NOT_BE_ENTIRELY_BOLD,
          },
        ],
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
    await validate(
      gutter,
      new Map([
        [
          rangeOver(content),
          {
            scope: 'block',
            severity: 'error',
            validatorKey: validations.PARAGRAPH_SHOULD_NOT_BE_ENTIRELY_BOLD,
          },
        ],
      ]),
    );

    await expect.element(page.getByRole('button', { name: 'Open validation' })).toBeInTheDocument();
    expect(page.getByRole('button', { name: /validations on this line/ }).query()).toBeNull();
  });

  it('emphasises the validated text while the indicator is hovered', async () => {
    const { content, gutter } = renderGutter('Ga naar <a href="#">lees meer</a>.');
    const range = rangeOver(content.querySelector('a')!);
    await validate(
      gutter,
      new Map([
        [range, { scope: 'inline', severity: 'info', validatorKey: validations.LINK_SHOULD_NOT_BE_TOO_GENERIC }],
      ]),
    );

    const indicator = page.getByRole('button', { name: 'Link text should not be too generic' });
    await indicator.hover();
    const hovered = CSS.highlights.get(VALIDATION_HOVER_HIGHLIGHT_NAMES.info);
    expect(hovered && [...hovered]).toEqual([range]);

    await indicator.unhover();
    expect(CSS.highlights.has(VALIDATION_HOVER_HIGHLIGHT_NAMES.info)).toBe(false);
  });
});
