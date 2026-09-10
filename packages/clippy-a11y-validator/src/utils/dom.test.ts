import { describe, expect, it } from 'vitest';
import { render } from '../test-helpers/render.ts';
import {
  changeTagName,
  hasHeadingLength,
  headingLevel,
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
