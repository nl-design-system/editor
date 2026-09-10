import { beforeEach, describe, expect, it } from 'vitest';
import { PageContext } from '../../page-context.ts';
import { render } from '../../test-helpers/render.ts';
import { containsEmphasis, expectedHeadingLevel, hasHeadingLength, headingLevel, precedingHeading } from './utils.ts';

/** The context a page validation would receive for the element `selector` matches inside `fragment`. */
const contextFor = (fragment: Element, selector: string) =>
  new PageContext([fragment]).for(fragment.querySelector<HTMLElement>(selector)!);

describe('hasHeadingLength', () => {
  it('is true up to the maximum heading length', () => {
    expect(hasHeadingLength(render(`<p>${'a'.repeat(60)}</p>`))).toBe(true);
  });

  it('is false one character beyond it', () => {
    expect(hasHeadingLength(render(`<p>${'a'.repeat(61)}</p>`))).toBe(false);
  });

  it('measures the text without the surrounding whitespace', () => {
    expect(hasHeadingLength(render(`<p>   ${'a'.repeat(60)}   </p>`))).toBe(true);
  });
});

describe('headingLevel', () => {
  it('reads the level from the tag name', () => {
    expect([1, 2, 3, 4, 5, 6].map((level) => headingLevel(render(`<h${level}>kop</h${level}>`)))).toEqual([
      1, 2, 3, 4, 5, 6,
    ]);
  });
});

describe('precedingHeading', () => {
  let fragment: HTMLElement;

  beforeEach(() => {
    fragment = document.createElement('div');
    document.body.replaceChildren(fragment);
  });

  const headingBefore = (html: string, selector: string): string | null => {
    fragment.innerHTML = html;
    return precedingHeading(contextFor(fragment, selector))?.tagName ?? null;
  };

  it('returns null for the first heading in the fragment', () => {
    expect(headingBefore('<h1>Titel</h1><h2>Kop</h2>', 'h1')).toBeNull();
  });

  it('returns the heading that directly precedes a sibling', () => {
    expect(headingBefore('<h1>Titel</h1><h2>Kop</h2>', 'h2')).toBe('H1');
  });

  it('skips over elements that are not headings', () => {
    expect(headingBefore('<h1>Titel</h1><p>tekst</p><ul><li>item</li></ul><h3>Kop</h3>', 'h3')).toBe('H1');
  });

  it('finds a heading nested in a preceding container', () => {
    expect(headingBefore('<section><h2>Kosten</h2></section><h3>Kop</h3>', 'h3')).toBe('H2');
  });

  it('finds a heading from inside a container', () => {
    expect(headingBefore('<h1>Titel</h1><section><h2>Kosten</h2></section>', 'h2')).toBe('H1');
  });

  it('returns the nearest of several preceding headings', () => {
    expect(headingBefore('<h1>Een</h1><h2>Twee</h2><h3>Drie</h3>', 'h3')).toBe('H2');
  });

  it('works for elements that are not headings themselves', () => {
    fragment.innerHTML = '<h2>Kop</h2><p>tekst</p>';
    expect(precedingHeading(contextFor(fragment, 'p'))?.tagName).toBe('H2');
  });

  it('stays inside the fragment and ignores headings elsewhere on the page', () => {
    const outside = document.createElement('h1');
    outside.textContent = 'Paginatitel';
    document.body.replaceChildren(outside, fragment);
    fragment.innerHTML = '<h2>Kop</h2>';

    expect(precedingHeading(contextFor(fragment, 'h2'))).toBeNull();
  });

  it('works on a detached tree', () => {
    const detached = document.createElement('div');
    detached.innerHTML = '<h1>Titel</h1><h2>Kop</h2>';

    expect(precedingHeading(contextFor(detached, 'h2'))?.tagName).toBe('H1');
  });

  it('does not treat an ancestor as preceding', () => {
    fragment.innerHTML = '<h1>Titel<span>deel</span></h1>';

    expect(precedingHeading(contextFor(fragment, 'span'))).toBeNull();
  });
});

describe('expectedHeadingLevel', () => {
  let fragment: HTMLElement;

  beforeEach(() => {
    fragment = document.createElement('div');
    document.body.replaceChildren(fragment);
  });

  const levelFor = (html: string, selector: string): number => {
    fragment.innerHTML = html;
    return expectedHeadingLevel(contextFor(fragment, selector));
  };

  it('is level one without a preceding heading', () => {
    expect(levelFor('<p>tekst</p>', 'p')).toBe(1);
  });

  it('is one level below the nearest preceding heading', () => {
    expect(levelFor('<h2>Kop</h2><p>tekst</p>', 'p')).toBe(3);
  });

  it('never goes deeper than level six', () => {
    expect(levelFor('<h6>Kop</h6><p>tekst</p>', 'p')).toBe(6);
  });
});

/** Renders `html` and runs the condition under test against the rendered element. */
const containsEmphasisFor = (html: string): boolean => {
  const element = render(html);
  return containsEmphasis(element);
};

describe('containsEmphasis', () => {
  it('is true for bold elements', () => {
    expect(containsEmphasisFor('<h1>kop met <strong>nadruk</strong></h1>')).toBe(true);
    expect(containsEmphasisFor('<h1>kop met <b>nadruk</b></h1>')).toBe(true);
  });

  it('is true for italic elements', () => {
    expect(containsEmphasisFor('<h1>kop met <em>nadruk</em></h1>')).toBe(true);
    expect(containsEmphasisFor('<h1>kop met <i>nadruk</i></h1>')).toBe(true);
  });

  it('is true when the emphasis is nested deeper', () => {
    expect(containsEmphasisFor('<h1><span><strong>nadruk</strong></span></h1>')).toBe(true);
  });

  it('is false for plain text', () => {
    expect(containsEmphasisFor('<h1>gewone kop</h1>')).toBe(false);
  });

  it('is false for other inline elements', () => {
    expect(containsEmphasisFor('<h1>kop met <code>code</code> en <mark>markering</mark></h1>')).toBe(false);
  });

  it('is false for an empty element', () => {
    expect(containsEmphasisFor('<h1></h1>')).toBe(false);
  });
});
