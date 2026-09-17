import { describe, expect, it } from 'vitest';
import { render } from '../test-helpers/render.ts';
import { ownTerms } from './description-list.ts';

const list = (html: string): HTMLDListElement => render(`<dl>${html}</dl>`) as HTMLDListElement;

describe('ownTerms', () => {
  it('collects the terms of the list', () => {
    const terms = ownTerms(list('<dt>een</dt><dd>beschrijving</dd><dt>twee</dt><dd>beschrijving</dd>'));

    expect(terms.map((term) => term.textContent)).toEqual(['een', 'twee']);
  });

  it('skips the terms of a nested list', () => {
    const terms = ownTerms(list('<dt>een</dt><dd><dl><dt>genest</dt><dd>beschrijving</dd></dl></dd>'));

    expect(terms.map((term) => term.textContent)).toEqual(['een']);
  });

  it('looks through a wrapper element around the pairs', () => {
    expect(ownTerms(list('<div class="item"><dt>een</dt><dd>beschrijving</dd></div>'))).toHaveLength(1);
  });

  it('is empty for a list without terms', () => {
    expect(ownTerms(list(''))).toEqual([]);
  });
});
