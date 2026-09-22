import { describe, expect, it } from 'vitest';
import { render } from '../test-helpers/render.ts';
import { isEntirelyBold } from './formatting.ts';

/** Renders `html` and runs the condition under test against the rendered element. */
const isEntirelyBoldFor = (html: string): boolean => {
  const element = render(html);
  return isEntirelyBold(element, element.parentElement!);
};

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
