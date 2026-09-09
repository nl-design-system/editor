import { describe, expect, it } from 'vitest';
import { render } from '../test-helpers/render.ts';
import { containsEmphasis, isEntirelyBold } from './formatting.ts';

const isBold = (html: string): boolean => {
  const element = render(html);
  return isEntirelyBold(element, element.parentElement!);
};

const hasEmphasis = (html: string): boolean => {
  const element = render(html);
  return containsEmphasis(element, element.parentElement!);
};

describe('isEntirelyBold', () => {
  it('is true when all text sits inside bold elements', () => {
    expect(isBold('<p><strong>a</strong></p>')).toBe(true);
    expect(isBold('<p><b>a</b></p>')).toBe(true);
    expect(isBold('<p><strong>a</strong> <b>b</b></p>')).toBe(true);
  });

  it('is true when the bold element sits inside another inline wrapper', () => {
    expect(isBold('<p><em><strong>a</strong></em></p>')).toBe(true);
    expect(isBold('<p><span class="x"><strong>a</strong></span></p>')).toBe(true);
  });

  it('is false when text sits outside the bold elements', () => {
    expect(isBold('<p><strong>a</strong> and more</p>')).toBe(false);
    expect(isBold('<p><strong>a</strong><em>b</em></p>')).toBe(false);
  });

  it('is false without visible text', () => {
    expect(isBold('<p></p>')).toBe(false);
    expect(isBold('<p> </p>')).toBe(false);
    expect(isBold('<p><strong> </strong></p>')).toBe(false);
  });

  it('is false for plain text', () => {
    expect(isBold('<p>plain</p>')).toBe(false);
  });
});

describe('containsEmphasis', () => {
  it('is true for bold elements', () => {
    expect(hasEmphasis('<h1>kop met <strong>nadruk</strong></h1>')).toBe(true);
    expect(hasEmphasis('<h1>kop met <b>nadruk</b></h1>')).toBe(true);
  });

  it('is true for italic elements', () => {
    expect(hasEmphasis('<h1>kop met <em>nadruk</em></h1>')).toBe(true);
    expect(hasEmphasis('<h1>kop met <i>nadruk</i></h1>')).toBe(true);
  });

  it('is true when the emphasis is nested deeper', () => {
    expect(hasEmphasis('<h1><span><strong>nadruk</strong></span></h1>')).toBe(true);
  });

  it('is false for plain text', () => {
    expect(hasEmphasis('<h1>gewone kop</h1>')).toBe(false);
  });

  it('is false for other inline elements', () => {
    expect(hasEmphasis('<h1>kop met <code>code</code> en <mark>markering</mark></h1>')).toBe(false);
  });

  it('is false for an empty element', () => {
    expect(hasEmphasis('<h1></h1>')).toBe(false);
  });
});
