import { beforeEach, describe, expect, it } from 'vitest';
import { selectors } from './consts/selectors.ts';
import { pageContext } from './context.ts';

const nearestPreceding = (
  element: HTMLElement,
  composedContent: readonly ParentNode[],
  selector: string,
): HTMLElement | null => pageContext(composedContent)(element).precedingMatches(selector)[0] ?? null;

const texts = (elements: readonly HTMLElement[]): string[] => elements.map(({ textContent }) => textContent ?? '');

describe('precedingMatches', () => {
  let contentRoot: HTMLElement;

  beforeEach(() => {
    contentRoot = document.createElement('div');
    document.body.replaceChildren(contentRoot);
  });

  const headingBefore = (html: string, selector: string): string | null => {
    contentRoot.innerHTML = html;
    return nearestPreceding(contentRoot.querySelector(selector)!, [contentRoot], selectors.HEADING)?.tagName ?? null;
  };

  it('returns null for the first heading in the content root', () => {
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
    contentRoot.innerHTML = '<h2>Kop</h2><p>tekst</p>';
    expect(nearestPreceding(contentRoot.querySelector('p')!, [contentRoot], selectors.HEADING)?.tagName).toBe('H2');
  });

  it('stays inside the composed content and ignores headings elsewhere on the page', () => {
    const outside = document.createElement('h1');
    outside.textContent = 'Paginatitel';
    document.body.replaceChildren(outside, contentRoot);
    contentRoot.innerHTML = '<h2>Kop</h2>';

    expect(nearestPreceding(contentRoot.querySelector('h2')!, [contentRoot], selectors.HEADING)).toBeNull();
  });

  it('does not treat an ancestor as preceding', () => {
    contentRoot.innerHTML = '<h1>Titel<span>deel</span></h1>';

    expect(nearestPreceding(contentRoot.querySelector('span')!, [contentRoot], selectors.HEADING)).toBeNull();
  });

  it('reads across content roots in the order they are given, whatever their document position', () => {
    const [first, second] = [document.createElement('div'), document.createElement('div')];
    first.innerHTML = '<h1>Titel</h1>';
    second.innerHTML = '<h2>Kop</h2>';
    document.body.replaceChildren(second, first);

    expect(nearestPreceding(second.querySelector('h2')!, [first, second], selectors.HEADING)?.tagName).toBe('H1');
  });

  it('lists every earlier match, nearest first', () => {
    contentRoot.innerHTML = '<h1>Een</h1><section><h2>Twee</h2></section><h3>Drie</h3><p>tekst</p>';

    expect(
      texts(pageContext([contentRoot])(contentRoot.querySelector('p')!).precedingMatches(selectors.HEADING)),
    ).toEqual(['Drie', 'Twee', 'Een']);
  });

  it('reads a detached proxy content root like any other', () => {
    const proxy = document.createElement('div');
    proxy.innerHTML = '<h1>Titel</h1>';
    contentRoot.innerHTML = '<h2>Kop</h2>';

    expect(
      nearestPreceding(contentRoot.querySelector('h2')!, [proxy, contentRoot], selectors.HEADING)?.textContent,
    ).toBe('Titel');
  });
});

describe('subsequentMatches', () => {
  let contentRoot: HTMLElement;

  beforeEach(() => {
    contentRoot = document.createElement('div');
    document.body.replaceChildren(contentRoot);
  });

  const headingsAfter = (html: string, selector: string): string[] => {
    contentRoot.innerHTML = html;
    return texts(pageContext([contentRoot])(contentRoot.querySelector(selector)!).subsequentMatches(selectors.HEADING));
  };

  it('lists every later match across containers, nearest first', () => {
    expect(headingsAfter('<p>tekst</p><h2>Een</h2><section><h3>Twee</h3></section><h4>Drie</h4>', 'p')).toEqual([
      'Een',
      'Twee',
      'Drie',
    ]);
  });

  it('skips over elements that do not match', () => {
    expect(headingsAfter('<h1>Titel</h1><p>tekst</p><ul><li>item</li></ul><h2>Kop</h2>', 'h1')).toEqual(['Kop']);
  });

  it('does not treat a descendant as subsequent', () => {
    expect(headingsAfter('<section><h2>Binnen</h2></section><h2>Buiten</h2>', 'section')).toEqual(['Buiten']);
  });

  it('reads across content roots in the order they are given', () => {
    const proxy = document.createElement('div');
    proxy.innerHTML = '<h1>Titel</h1>';
    contentRoot.innerHTML = '<h2>Kop</h2>';

    expect(
      texts(pageContext([proxy, contentRoot])(proxy.querySelector('h1')!).subsequentMatches(selectors.HEADING)),
    ).toEqual(['Kop']);
  });

  it('is empty for the last match', () => {
    expect(headingsAfter('<h1>Een</h1><h2>Twee</h2>', 'h2')).toEqual([]);
  });

  it('finds nothing after an element that has left the page', () => {
    contentRoot.innerHTML = '<h1>Een</h1><h2>Twee</h2>';
    const one = contentRoot.querySelector('h1')!;
    const contextForOne = pageContext([contentRoot])(one);

    one.remove();

    expect(contextForOne.subsequentMatches(selectors.HEADING)).toEqual([]);
  });
});

describe('precedingSiblingMatches', () => {
  let contentRoot: HTMLElement;

  beforeEach(() => {
    contentRoot = document.createElement('div');
    document.body.replaceChildren(contentRoot);
  });

  const precedingTexts = (html: string, selector: string = selectors.PARAGRAPH): string[] => {
    contentRoot.innerHTML = html;
    const paragraphs = contentRoot.querySelectorAll<HTMLElement>(':scope > p');
    return texts(pageContext([contentRoot])(paragraphs[paragraphs.length - 1]!).precedingSiblingMatches(selector));
  };

  it('returns the unbroken run of matching previous siblings, nearest first', () => {
    expect(precedingTexts('<p>een</p><p>twee</p><p>drie</p>')).toEqual(['twee', 'een']);
  });

  it('stops at the first sibling that does not match', () => {
    expect(precedingTexts('<p>een</p><div>anders</div><p>twee</p><p>drie</p>')).toEqual(['twee']);
  });

  it('never crosses into another container', () => {
    expect(precedingTexts('<div><p>een</p></div><p>twee</p>')).toEqual([]);
  });

  it('is empty for the first element', () => {
    expect(precedingTexts('<p>een</p>')).toEqual([]);
  });
});

describe('subsequentSiblingMatches', () => {
  let contentRoot: HTMLElement;

  beforeEach(() => {
    contentRoot = document.createElement('div');
    document.body.replaceChildren(contentRoot);
  });

  const subsequentTexts = (html: string, selector: string = selectors.PARAGRAPH): string[] => {
    contentRoot.innerHTML = html;
    return texts(pageContext([contentRoot])(contentRoot.querySelector('p')!).subsequentSiblingMatches(selector));
  };

  it('returns the unbroken run of matching next siblings', () => {
    expect(subsequentTexts('<p>een</p><p>twee</p><p>drie</p>')).toEqual(['twee', 'drie']);
  });

  it('stops at the first sibling that does not match', () => {
    expect(subsequentTexts('<p>een</p><p>twee</p><div>anders</div><p>drie</p>')).toEqual(['twee']);
  });

  it('never crosses into another container', () => {
    expect(subsequentTexts('<p>een</p><div><p>twee</p></div>')).toEqual([]);
  });

  it('never leaves the parent', () => {
    expect(subsequentTexts('<div><p>een</p></div><p>twee</p>')).toEqual([]);
  });

  it('is empty for the last element', () => {
    expect(subsequentTexts('<p>een</p>')).toEqual([]);
  });
});

describe('a context', () => {
  it('answers from the page as it is now, after content has changed', () => {
    const contentRoot = document.createElement('div');
    contentRoot.innerHTML = '<h1>Een</h1><h3>Twee</h3><h5>Drie</h5>';
    const contextFor = pageContext([contentRoot]);
    const [, three, five] = contentRoot.querySelectorAll<HTMLElement>('h1, h3, h5');

    three!.replaceWith(document.createElement('h2'));

    expect(contextFor(five!).precedingMatches(selectors.HEADING)[0]?.tagName).toBe('H2');
  });

  it('finds nothing before an element that has left the page', () => {
    const contentRoot = document.createElement('div');
    contentRoot.innerHTML = '<h1>Een</h1><h2>Twee</h2>';
    const contextFor = pageContext([contentRoot]);
    const two = contentRoot.querySelector('h2')!;

    two.remove();

    expect(contextFor(two).precedingMatches(selectors.HEADING)).toEqual([]);
  });
});
