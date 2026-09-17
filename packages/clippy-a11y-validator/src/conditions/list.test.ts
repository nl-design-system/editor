import { describe, expect, it } from 'vitest';
import { render } from '../test-helpers/render.ts';
import { resemblesListItem } from './list.ts';

/** Renders a container and tests its first paragraph, so sibling lookahead has something to find. */
const resemblesListItemFor = (html: string): boolean => {
  const container = render(`<div>${html}</div>`);
  return resemblesListItem(container.querySelector('p')!, container);
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
