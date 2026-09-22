import { describe, expect, it } from 'vitest';
import { render } from '../../test-helpers/render.ts';
import {
  convertParagraphsToList,
  decrementPrefix,
  isEntirelyBold,
  isOrderedListItem,
  isOrderedPrefix,
  isUnorderedPrefix,
  listPrefix,
  resemblesListItem,
  stripListPrefix,
} from './utils.ts';

describe('listPrefix', () => {
  it('takes the first two characters', () => {
    expect(listPrefix('1. een')).toBe('1.');
    expect(listPrefix('- een')).toBe('- ');
  });

  it('copes with text shorter than the prefix', () => {
    expect(listPrefix('')).toBe('');
    expect(listPrefix('a')).toBe('a');
  });
});

describe('isOrderedPrefix', () => {
  it('recognises a number followed by a delimiter', () => {
    expect(['1.', '2)', '3]', '4/', '5 '].every(isOrderedPrefix)).toBe(true);
  });

  it('rejects text without a delimiter', () => {
    expect(['12', 'ab', '- ', ''].some(isOrderedPrefix)).toBe(false);
  });
});

describe('isUnorderedPrefix', () => {
  it('recognises a bullet followed by whitespace', () => {
    expect(['- ', '* ', '+ ', '• '].every(isUnorderedPrefix)).toBe(true);
  });

  it('rejects a bullet without whitespace', () => {
    expect(isUnorderedPrefix('-a')).toBe(false);
  });

  it('rejects an ordered prefix', () => {
    expect(isUnorderedPrefix('1.')).toBe(false);
  });
});

describe('decrementPrefix', () => {
  it('turns a second marker into the first', () => {
    expect(decrementPrefix('2.')).toBe('1.');
    expect(decrementPrefix('2)')).toBe('1)');
  });

  it('leaves bullets unchanged', () => {
    expect(decrementPrefix('- ')).toBe('- ');
  });

  it('leaves other numbers unchanged', () => {
    expect(decrementPrefix('7.')).toBe('7.');
  });
});

describe('isOrderedListItem', () => {
  it('is true for a numbered paragraph', () => {
    expect(isOrderedListItem(render('<p>1. een</p>'))).toBe(true);
  });

  it('is false for a bulleted paragraph', () => {
    expect(isOrderedListItem(render('<p>- een</p>'))).toBe(false);
  });
});

describe('stripListPrefix', () => {
  it('removes an ordered marker', () => {
    expect(stripListPrefix('1. Test', true)).toBe('Test');
    expect(stripListPrefix('1 - Test', true)).toBe('Test');
    expect(stripListPrefix('2) Test', true)).toBe('Test');
  });

  it('removes an unordered marker', () => {
    expect(stripListPrefix('- Test', false)).toBe('Test');
    expect(stripListPrefix('• Test', false)).toBe('Test');
  });

  it('leaves text without a marker alone', () => {
    expect(stripListPrefix('Test', false)).toBe('Test');
  });
});

describe('convertParagraphsToList', () => {
  const container = (html: string): HTMLElement => render(`<div>${html}</div>`);

  /** name, input, isOrdered, expected markup — each case asserts the whole rewritten container. */
  const conversions: [string, string, boolean, string][] = [
    [
      'converts a run of numbered paragraphs into an ol',
      '<p>1. een</p><p>2. twee</p>',
      true,
      '<ol><li>een</li><li>twee</li></ol>',
    ],
    [
      'converts a run of bulleted paragraphs into a ul',
      '<p>- een</p><p>- twee</p>',
      false,
      '<ul><li>een</li><li>twee</li></ul>',
    ],
    [
      'stops at the first paragraph that is not list-like',
      '<p>- een</p><p>- twee</p><p>Gewone tekst.</p>',
      false,
      '<ul><li>een</li><li>twee</li></ul><p>Gewone tekst.</p>',
    ],
    [
      'inserts the list where the paragraphs were',
      '<h1>Titel</h1><p>- een</p><p>- twee</p><p>Slot.</p>',
      false,
      '<h1>Titel</h1><ul><li>een</li><li>twee</li></ul><p>Slot.</p>',
    ],
  ];

  it.each(conversions)('%s', (_name, html, isOrdered, expected) => {
    const root = container(html);
    convertParagraphsToList(root.querySelector('p')!, isOrdered);

    expect(root.innerHTML).toBe(expected);
  });

  it('splits a line-broken paragraph into separate items', () => {
    const root = container('<p>- een<br>- twee<br>- drie</p>');
    convertParagraphsToList(root.querySelector('p')!, false);

    expect(root.querySelectorAll('li')).toHaveLength(3);
  });

  it('does nothing for a detached paragraph', () => {
    const detached = document.createElement('p');
    detached.textContent = '- een';

    expect(() => convertParagraphsToList(detached, false)).not.toThrow();
  });
});

/** Renders a container and tests its first paragraph, so sibling lookahead has something to find. */
const resemblesListItemFor = (html: string): boolean => {
  const container = render(`<div>${html}</div>`);
  return resemblesListItem(container.querySelector('p')!, container);
};

/** Renders `html` and runs the condition under test against the rendered element. */
const isEntirelyBoldFor = (html: string): boolean => {
  const element = render(html);
  return isEntirelyBold(element, element.parentElement!);
};

describe('resemblesListItem', () => {
  it('is true when a line-broken second line continues the sequence', () => {
    expect(resemblesListItemFor('<p>1. een<br>2. twee</p>')).toBe(true);
    expect(resemblesListItemFor('<p>- een<br>- twee</p>')).toBe(true);
  });

  it('is true when the next sibling continues the sequence', () => {
    expect(resemblesListItemFor('<p>1. een</p><p>2. twee</p>')).toBe(true);
    expect(resemblesListItemFor('<p>- een</p><p>- twee</p>')).toBe(true);
  });

  it('recognises every supported marker', () => {
    expect(['-', '*', '+', '•'].every((marker) => resemblesListItemFor(`<p>${marker} een<br>${marker} twee</p>`))).toBe(
      true,
    );
  });

  it('recognises every supported number delimiter', () => {
    expect(
      ['.', ')', ']', '/'].every((delimiter) => resemblesListItemFor(`<p>1${delimiter} een<br>2${delimiter} twee</p>`)),
    ).toBe(true);
  });

  it('is false for a single marked line with nothing following it', () => {
    expect(resemblesListItemFor('<p>- een</p>')).toBe(false);
  });

  it('is false when the numbering does not continue', () => {
    expect(resemblesListItemFor('<p>1. een<br>7. zeven</p>')).toBe(false);
  });

  it('is false when the next sibling is a different kind of element', () => {
    expect(resemblesListItemFor('<p>- een</p><div>- twee</div>')).toBe(false);
  });

  it('is false for ordinary prose', () => {
    expect(resemblesListItemFor('<p>Neem uw paspoort mee.</p>')).toBe(false);
  });

  it('is false for an empty paragraph', () => {
    expect(resemblesListItemFor('<p></p>')).toBe(false);
  });
});

describe('isEntirelyBold', () => {
  it('is true when all text sits inside bold elements', () => {
    expect(isEntirelyBoldFor('<p><strong>a</strong></p>')).toBe(true);
    expect(isEntirelyBoldFor('<p><b>a</b></p>')).toBe(true);
    expect(isEntirelyBoldFor('<p><strong>a</strong> <b>b</b></p>')).toBe(true);
  });

  it('is true when the bold element sits inside another inline wrapper', () => {
    expect(isEntirelyBoldFor('<p><em><strong>a</strong></em></p>')).toBe(true);
    expect(isEntirelyBoldFor('<p><span class="x"><strong>a</strong></span></p>')).toBe(true);
  });

  it('is false when text sits outside the bold elements', () => {
    expect(isEntirelyBoldFor('<p><strong>a</strong> and more</p>')).toBe(false);
    expect(isEntirelyBoldFor('<p><strong>a</strong><em>b</em></p>')).toBe(false);
  });

  it('is false without visible text', () => {
    expect(isEntirelyBoldFor('<p></p>')).toBe(false);
    expect(isEntirelyBoldFor('<p> </p>')).toBe(false);
    expect(isEntirelyBoldFor('<p><strong> </strong></p>')).toBe(false);
  });

  it('is false for plain text', () => {
    expect(isEntirelyBoldFor('<p>plain</p>')).toBe(false);
  });
});
