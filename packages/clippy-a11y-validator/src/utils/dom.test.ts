import { beforeEach, describe, expect, it } from 'vitest';
import { render } from '../test-helpers/render.ts';
import {
  changeTagName,
  hasHeadingLength,
  headingLevel,
  precedingHeading,
  textLines,
  trimmedText,
  unwrapElement,
  visibleTextNodes,
} from './dom.ts';

describe('visibleTextNodes', () => {
  it('collects text nodes that hold content', () => {
    expect(visibleTextNodes(render('<p><b>a</b> b</p>')).map((node) => node.data)).toEqual(['a', ' b']);
  });

  it('skips whitespace-only text nodes', () => {
    expect(visibleTextNodes(render('<p> <b> </b> </p>'))).toEqual([]);
  });
});

describe('trimmedText', () => {
  it('joins the text of the descendants without the surrounding whitespace', () => {
    expect(trimmedText(render('<p>  <strong>Let op:</strong> lees dit  </p>'))).toBe('Let op: lees dit');
  });

  it('is empty for an element without text', () => {
    expect(trimmedText(render('<p> <br> </p>'))).toBe('');
  });
});

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

describe('unwrapElement', () => {
  it('replaces the element with its children', () => {
    const paragraph = render('<p><strong>bold</strong> tail</p>');
    unwrapElement(paragraph.querySelector('strong')!);
    expect(paragraph.innerHTML).toBe('bold tail');
  });

  it('does nothing for a detached element', () => {
    const detached = document.createElement('strong');
    expect(() => unwrapElement(detached)).not.toThrow();
  });
});

describe('changeTagName', () => {
  it('replaces the element with one under the new tag', () => {
    const container = render('<div><p>tekst</p></div>');
    changeTagName(container.querySelector('p')!, 'h2');

    expect(container.innerHTML).toBe('<h2>tekst</h2>');
  });

  it('keeps the attributes of the original element', () => {
    const container = render('<div><p id="intro" class="lead">tekst</p></div>');
    changeTagName(container.querySelector('p')!, 'h1');

    const heading = container.querySelector('h1');
    expect(heading?.id).toBe('intro');
    expect(heading?.className).toBe('lead');
  });

  it('moves the child nodes rather than reserialising them', () => {
    const container = render('<div><p><strong>dik</strong> en gewoon</p></div>');
    const strong = container.querySelector('strong')!;
    changeTagName(container.querySelector('p')!, 'h2');

    expect(container.querySelector('h2 strong')).toBe(strong);
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
  let root: HTMLElement;

  beforeEach(() => {
    root = document.createElement('div');
    document.body.replaceChildren(root);
  });

  const headingBefore = (html: string, selector: string): string | null => {
    root.innerHTML = html;
    return precedingHeading(root.querySelector(selector)!, root)?.tagName ?? null;
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
    expect(precedingHeading(root.querySelector('p')!, root)?.tagName).toBe('H2');
  });

  it('stays inside the root and ignores headings elsewhere on the page', () => {
    const outside = document.createElement('h1');
    outside.textContent = 'Paginatitel';
    document.body.replaceChildren(outside, root);
    root.innerHTML = '<h2>Kop</h2>';

    expect(precedingHeading(root.querySelector('h2')!, root)).toBeNull();
  });

  it('works on a detached tree', () => {
    const detached = document.createElement('div');
    detached.innerHTML = '<h1>Titel</h1><h2>Kop</h2>';

    expect(precedingHeading(detached.querySelector('h2')!, detached)?.tagName).toBe('H1');
  });

  it('does not treat an ancestor as preceding', () => {
    root.innerHTML = '<h1>Titel<span>deel</span></h1>';

    expect(precedingHeading(root.querySelector('span')!, root)).toBeNull();
  });
});

describe('textLines', () => {
  it('returns a single line when there is no break', () => {
    expect(textLines(render('<p>een regel</p>'))).toEqual(['een regel']);
  });

  it('splits on a line break', () => {
    expect(textLines(render('<p>1. een<br>2. twee</p>'))).toEqual(['1. een', '2. twee']);
  });

  it('includes text from inline elements in the line', () => {
    expect(textLines(render('<p><strong>1.</strong> een<br>2. twee</p>'))).toEqual(['1. een', '2. twee']);
  });

  it('drops blank lines', () => {
    expect(textLines(render('<p>een<br><br>twee</p>'))).toEqual(['een', 'twee']);
  });

  it('returns nothing for an element without text', () => {
    expect(textLines(render('<p><br></p>'))).toEqual([]);
  });
});
