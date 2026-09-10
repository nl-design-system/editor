import { beforeEach, describe, expect, it } from 'vitest';
import { selectors } from './consts/selectors.ts';
import { pageContext } from './context.ts';

const previous = (element: Element, roots: readonly ParentNode[], selector: string): HTMLElement | null =>
  pageContext(roots)(element).previous(selector);

describe('previous', () => {
  let root: HTMLElement;

  beforeEach(() => {
    root = document.createElement('div');
    document.body.replaceChildren(root);
  });

  const headingBefore = (html: string, selector: string): string | null => {
    root.innerHTML = html;
    return previous(root.querySelector(selector)!, [root], selectors.HEADING)?.tagName ?? null;
  };

  it('returns null for the first heading in the root', () => {
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
    root.innerHTML = '<h2>Kop</h2><p>tekst</p>';
    expect(previous(root.querySelector('p')!, [root], selectors.HEADING)?.tagName).toBe('H2');
  });

  it('stays inside the roots and ignores headings elsewhere on the page', () => {
    const outside = document.createElement('h1');
    outside.textContent = 'Paginatitel';
    document.body.replaceChildren(outside, root);
    root.innerHTML = '<h2>Kop</h2>';

    expect(previous(root.querySelector('h2')!, [root], selectors.HEADING)).toBeNull();
  });

  it('does not treat an ancestor as preceding', () => {
    root.innerHTML = '<h1>Titel<span>deel</span></h1>';

    expect(previous(root.querySelector('span')!, [root], selectors.HEADING)).toBeNull();
  });

  it('reads across roots in the order they are given, whatever their document position', () => {
    const [first, second] = [document.createElement('div'), document.createElement('div')];
    first.innerHTML = '<h1>Titel</h1>';
    second.innerHTML = '<h2>Kop</h2>';
    document.body.replaceChildren(second, first);

    expect(previous(second.querySelector('h2')!, [first, second], selectors.HEADING)?.tagName).toBe('H1');
  });

  it('reads a detached proxy root like any other', () => {
    const proxy = document.createElement('div');
    proxy.innerHTML = '<h1>Titel</h1>';
    root.innerHTML = '<h2>Kop</h2>';

    expect(previous(root.querySelector('h2')!, [proxy, root], selectors.HEADING)?.textContent).toBe('Titel');
  });
});

describe('following', () => {
  let root: HTMLElement;

  beforeEach(() => {
    root = document.createElement('div');
    document.body.replaceChildren(root);
  });

  const followingTexts = (html: string, selector: string = selectors.PARAGRAPH): string[] => {
    root.innerHTML = html;
    return pageContext([root])(root.querySelector('p')!)
      .following(selector)
      .map(({ textContent }) => textContent ?? '');
  };

  it('returns the unbroken run of matching next siblings', () => {
    expect(followingTexts('<p>een</p><p>twee</p><p>drie</p>')).toEqual(['twee', 'drie']);
  });

  it('stops at the first sibling that does not match', () => {
    expect(followingTexts('<p>een</p><p>twee</p><div>anders</div><p>drie</p>')).toEqual(['twee']);
  });

  it('never crosses into another container', () => {
    expect(followingTexts('<p>een</p><div><p>twee</p></div>')).toEqual([]);
  });

  it('never leaves the parent', () => {
    expect(followingTexts('<div><p>een</p></div><p>twee</p>')).toEqual([]);
  });

  it('is empty for the last element', () => {
    expect(followingTexts('<p>een</p>')).toEqual([]);
  });
});

describe('a context', () => {
  it('answers from the page as it is now, after content has changed', () => {
    const root = document.createElement('div');
    root.innerHTML = '<h1>Een</h1><h3>Twee</h3><h5>Drie</h5>';
    const contextFor = pageContext([root]);
    const [, three, five] = root.querySelectorAll('h1, h3, h5');

    three!.replaceWith(document.createElement('h2'));

    expect(contextFor(five!).previous(selectors.HEADING)?.tagName).toBe('H2');
  });

  it('finds nothing before an element that has left the page', () => {
    const root = document.createElement('div');
    root.innerHTML = '<h1>Een</h1><h2>Twee</h2>';
    const contextFor = pageContext([root]);
    const two = root.querySelector('h2')!;

    two.remove();

    expect(contextFor(two).previous(selectors.HEADING)).toBeNull();
  });
});
