import { describe, expect, it } from 'vitest';
import { pageContext } from '../context.ts';
import { render } from '../test-helpers/render.ts';
import { resemblesListItem } from './list.ts';

const looksLikeList = (html: string): boolean => {
  const container = render(`<div>${html}</div>`);
  const paragraph = container.querySelector('p')!;
  return resemblesListItem(paragraph, pageContext([container])(paragraph));
};

describe('resemblesListItem', () => {
  it('is true when a line-broken second line continues the sequence', () => {
    expect(looksLikeList('<p>1. een<br>2. twee</p>')).toBe(true);
    expect(looksLikeList('<p>- een<br>- twee</p>')).toBe(true);
  });

  it('is true when the next sibling continues the sequence', () => {
    expect(looksLikeList('<p>1. een</p><p>2. twee</p>')).toBe(true);
    expect(looksLikeList('<p>- een</p><p>- twee</p>')).toBe(true);
  });

  it('recognises every supported marker', () => {
    expect(['-', '*', '+', '•'].every((marker) => looksLikeList(`<p>${marker} een<br>${marker} twee</p>`))).toBe(true);
  });

  it('recognises every supported number delimiter', () => {
    expect(
      ['.', ')', ']', '/'].every((delimiter) => looksLikeList(`<p>1${delimiter} een<br>2${delimiter} twee</p>`)),
    ).toBe(true);
  });

  it('is false for a single marked line with nothing following it', () => {
    expect(looksLikeList('<p>- een</p>')).toBe(false);
  });

  it('is false when the numbering does not continue', () => {
    expect(looksLikeList('<p>1. een<br>7. zeven</p>')).toBe(false);
  });

  it('is false when the next list-like paragraph is in another container', () => {
    expect(looksLikeList('<p>- een</p><div><p>- twee</p></div>')).toBe(false);
  });

  it('is false when the next sibling is a different kind of element', () => {
    expect(looksLikeList('<p>- een</p><div>- twee</div>')).toBe(false);
  });

  it('is false for ordinary prose', () => {
    expect(looksLikeList('<p>Neem uw paspoort mee.</p>')).toBe(false);
  });

  it('is false for an empty paragraph', () => {
    expect(looksLikeList('<p></p>')).toBe(false);
  });
});
