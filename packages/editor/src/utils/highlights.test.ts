import { afterEach, describe, expect, it } from 'vitest';
import type { ValidationsMap } from '@/types/validation';
import {
  applyHoverHighlight,
  applyValidationHighlights,
  clearHoverHighlight,
  clearValidationHighlights,
  VALIDATION_BLANK_HIGHLIGHT_NAMES,
  VALIDATION_HIGHLIGHT_NAMES,
  VALIDATION_HOVER_HIGHLIGHT_NAMES,
} from './highlights';

function setupContent(text = 'Lees meer'): HTMLElement {
  const container = document.createElement('div');
  container.innerHTML = `<p>${text}</p>`;
  document.body.appendChild(container);
  return container;
}

function rangeOf(el: Element): Range {
  const range = document.createRange();
  range.selectNodeContents(el);
  return range;
}

function registeredRanges(name: string): AbstractRange[] {
  const highlight = CSS.highlights.get(name);
  return highlight ? [...highlight] : [];
}

describe('applyValidationHighlights', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    CSS.highlights.clear();
  });

  it('registers a highlight per severity for inline validations', () => {
    const container = setupContent();
    const owner = {};
    const infoRange = rangeOf(container.querySelector('p')!);
    const map: ValidationsMap = new Map([[infoRange, { scope: 'inline', severity: 'info' }]]);

    applyValidationHighlights(owner, map);

    expect(registeredRanges(VALIDATION_HIGHLIGHT_NAMES.info)).toEqual([infoRange]);
    expect(CSS.highlights.has(VALIDATION_HIGHLIGHT_NAMES.error)).toBe(false);

    clearValidationHighlights(owner);
  });

  it('leaves block-scoped validations to the gutter band', () => {
    const container = setupContent();
    const owner = {};
    const map: ValidationsMap = new Map([
      [rangeOf(container.querySelector('p')!), { scope: 'block', severity: 'error' }],
    ]);

    applyValidationHighlights(owner, map);

    expect(CSS.highlights.has(VALIDATION_HIGHLIGHT_NAMES.error)).toBe(false);

    clearValidationHighlights(owner);
  });

  it('adopts the highlight stylesheet into the tree scope of the highlighted content', () => {
    const container = setupContent();
    const owner = {};
    const map: ValidationsMap = new Map([
      [rangeOf(container.querySelector('p')!), { scope: 'inline', severity: 'error' }],
    ]);

    applyValidationHighlights(owner, map);

    const hasHighlightRule = document.adoptedStyleSheets.some((sheet) =>
      [...sheet.cssRules].some((rule) => rule.cssText.includes(`::highlight(${VALIDATION_HIGHLIGHT_NAMES.error})`)),
    );
    expect(hasHighlightRule).toBe(true);

    clearValidationHighlights(owner);
  });

  it('distinguishes the severities by the line above the text, not by colour alone', () => {
    const container = setupContent();
    const owner = {};
    applyValidationHighlights(
      owner,
      new Map([[rangeOf(container.querySelector('p')!), { scope: 'inline', severity: 'error' }]]),
    );

    const rules = document.adoptedStyleSheets
      .flatMap((sheet) => [...sheet.cssRules])
      .filter((rule): rule is CSSStyleRule => rule instanceof CSSStyleRule && rule.cssText.includes('::highlight('));

    const decorationFor = (name: string) => {
      const rule = rules.find((r) => r.selectorText === `::highlight(${name})`);
      return `${rule?.style.textDecorationLine} ${rule?.style.textDecorationStyle}`;
    };

    expect(decorationFor(VALIDATION_HIGHLIGHT_NAMES.error)).toBe('overline double');
    expect(decorationFor(VALIDATION_HIGHLIGHT_NAMES.warning)).toBe('overline solid');
    expect(decorationFor(VALIDATION_HIGHLIGHT_NAMES.info)).toBe('overline dotted');
    expect(decorationFor(VALIDATION_HOVER_HIGHLIGHT_NAMES.error)).toBe('overline double');
    expect(decorationFor(VALIDATION_HOVER_HIGHLIGHT_NAMES.warning)).toBe('overline solid');
    expect(decorationFor(VALIDATION_HOVER_HIGHLIGHT_NAMES.info)).toBe('overline dotted');

    clearValidationHighlights(owner);
  });

  it('marks a validation on an element with no text with a solid bar instead', () => {
    const container = setupContent();
    const paragraph = container.querySelector('p')!;
    paragraph.innerHTML = 'Ga naar <em> </em>de site';
    const owner = {};
    const blankRange = rangeOf(paragraph.querySelector('em')!);

    applyValidationHighlights(owner, new Map([[blankRange, { scope: 'inline', severity: 'warning' }]]));

    expect(registeredRanges(VALIDATION_BLANK_HIGHLIGHT_NAMES.warning)).toEqual([blankRange]);
    expect(CSS.highlights.has(VALIDATION_HIGHLIGHT_NAMES.warning)).toBe(false);

    applyHoverHighlight('warning', blankRange);
    expect(CSS.highlights.has(VALIDATION_HOVER_HIGHLIGHT_NAMES.warning)).toBe(false);

    clearValidationHighlights(owner);
    expect(CSS.highlights.has(VALIDATION_BLANK_HIGHLIGHT_NAMES.warning)).toBe(false);
  });

  it('keeps a text-bearing range on the tinted style when a blank one is present', () => {
    const container = setupContent();
    const paragraph = container.querySelector('p')!;
    paragraph.innerHTML = 'Ga naar <em> </em><a href="#">lees meer</a>';
    const owner = {};
    const blankRange = rangeOf(paragraph.querySelector('em')!);
    const textRange = rangeOf(paragraph.querySelector('a')!);

    applyValidationHighlights(
      owner,
      new Map([
        [blankRange, { scope: 'inline', severity: 'warning' }],
        [textRange, { scope: 'inline', severity: 'warning' }],
      ]),
    );

    expect(registeredRanges(VALIDATION_HIGHLIGHT_NAMES.warning)).toEqual([textRange]);
    expect(registeredRanges(VALIDATION_BLANK_HIGHLIGHT_NAMES.warning)).toEqual([blankRange]);

    clearValidationHighlights(owner);
  });

  it('keeps highlights of other owners when one owner updates or goes away', () => {
    const container = setupContent();
    const [first, second] = [document.createElement('p'), document.createElement('p')];
    first.textContent = 'Klik hier';
    second.textContent = 'Lees meer';
    container.append(first, second);

    const ownerA = {};
    const ownerB = {};
    const rangeA = rangeOf(first);
    const rangeB = rangeOf(second);

    applyValidationHighlights(ownerA, new Map([[rangeA, { scope: 'inline', severity: 'info' }]]));
    applyValidationHighlights(ownerB, new Map([[rangeB, { scope: 'inline', severity: 'info' }]]));

    expect(registeredRanges(VALIDATION_HIGHLIGHT_NAMES.info)).toEqual([rangeA, rangeB]);

    clearValidationHighlights(ownerA);

    expect(registeredRanges(VALIDATION_HIGHLIGHT_NAMES.info)).toEqual([rangeB]);

    clearValidationHighlights(ownerB);

    expect(CSS.highlights.has(VALIDATION_HIGHLIGHT_NAMES.info)).toBe(false);
  });

  it('drops the previous ranges of an owner when its validations change', () => {
    const container = setupContent();
    const owner = {};
    const paragraph = container.querySelector('p')!;
    const staleRange = rangeOf(paragraph);
    const freshRange = rangeOf(paragraph);

    applyValidationHighlights(owner, new Map([[staleRange, { scope: 'inline', severity: 'warning' }]]));
    applyValidationHighlights(owner, new Map([[freshRange, { scope: 'inline', severity: 'warning' }]]));

    expect(registeredRanges(VALIDATION_HIGHLIGHT_NAMES.warning)).toEqual([freshRange]);

    clearValidationHighlights(owner);
  });
});

describe('applyHoverHighlight', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    CSS.highlights.clear();
  });

  it('registers a single hover range and paints above the persistent highlights', () => {
    const container = setupContent();
    const range = rangeOf(container.querySelector('p')!);

    applyHoverHighlight('error', range);

    const hover = CSS.highlights.get(VALIDATION_HOVER_HIGHLIGHT_NAMES.error);
    expect(hover && [...hover]).toEqual([range]);
    expect(hover?.priority).toBeGreaterThan(0);
  });

  it('replaces a hover highlight of another severity', () => {
    const container = setupContent();
    const range = rangeOf(container.querySelector('p')!);

    applyHoverHighlight('error', range);
    applyHoverHighlight('warning', range);

    expect(CSS.highlights.has(VALIDATION_HOVER_HIGHLIGHT_NAMES.error)).toBe(false);
    expect(CSS.highlights.has(VALIDATION_HOVER_HIGHLIGHT_NAMES.warning)).toBe(true);
  });

  it('clears every hover highlight', () => {
    const container = setupContent();
    applyHoverHighlight('info', rangeOf(container.querySelector('p')!));

    clearHoverHighlight();

    expect(CSS.highlights.has(VALIDATION_HOVER_HIGHLIGHT_NAMES.info)).toBe(false);
  });
});
