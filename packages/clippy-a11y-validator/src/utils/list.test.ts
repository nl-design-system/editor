import { describe, expect, it } from 'vitest';
import { render } from '../test-helpers/render.ts';
import {
  convertParagraphsToList,
  decrementPrefix,
  isOrderedListItem,
  isOrderedPrefix,
  isUnorderedPrefix,
  listPrefix,
  stripListPrefix,
} from './list.ts';

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

  it('converts a run of numbered paragraphs into an ol', () => {
    const root = container('<p>1. een</p><p>2. twee</p>');
    convertParagraphsToList(root.querySelector('p')!, true);

    expect(root.innerHTML).toBe('<ol><li>een</li><li>twee</li></ol>');
  });

  it('converts a run of bulleted paragraphs into a ul', () => {
    const root = container('<p>- een</p><p>- twee</p>');
    convertParagraphsToList(root.querySelector('p')!, false);

    expect(root.innerHTML).toBe('<ul><li>een</li><li>twee</li></ul>');
  });

  it('splits a line-broken paragraph into separate items', () => {
    const root = container('<p>- een<br>- twee<br>- drie</p>');
    convertParagraphsToList(root.querySelector('p')!, false);

    expect(root.querySelectorAll('li')).toHaveLength(3);
  });

  it('stops at the first paragraph that is not list-like', () => {
    const root = container('<p>- een</p><p>- twee</p><p>Gewone tekst.</p>');
    convertParagraphsToList(root.querySelector('p')!, false);

    expect(root.innerHTML).toBe('<ul><li>een</li><li>twee</li></ul><p>Gewone tekst.</p>');
  });

  it('inserts the list where the paragraphs were', () => {
    const root = container('<h1>Titel</h1><p>- een</p><p>- twee</p><p>Slot.</p>');
    convertParagraphsToList(root.querySelector('p')!, false);

    expect(root.innerHTML).toBe('<h1>Titel</h1><ul><li>een</li><li>twee</li></ul><p>Slot.</p>');
  });

  it('does nothing for a detached paragraph', () => {
    const detached = document.createElement('p');
    detached.textContent = '- een';

    expect(() => convertParagraphsToList(detached, false)).not.toThrow();
  });
});
