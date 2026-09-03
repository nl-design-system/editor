import { describe, expect, it } from 'vitest';
import { render } from '../test-helpers/render.ts';
import { isNotEntirelyBold } from './formatting.ts';

describe('isNotEntirelyBold', () => {
  it('is false when all text sits inside bold elements', () => {
    expect(isNotEntirelyBold(render('<p><strong>a</strong></p>'))).toBe(false);
    expect(isNotEntirelyBold(render('<p><b>a</b></p>'))).toBe(false);
    expect(isNotEntirelyBold(render('<p><strong>a</strong> <b>b</b></p>'))).toBe(false);
  });

  it('is false when the bold element sits inside another inline wrapper', () => {
    expect(isNotEntirelyBold(render('<p><em><strong>a</strong></em></p>'))).toBe(false);
    expect(isNotEntirelyBold(render('<p><span class="x"><strong>a</strong></span></p>'))).toBe(false);
  });

  it('is true when text sits outside the bold elements', () => {
    expect(isNotEntirelyBold(render('<p><strong>a</strong> and more</p>'))).toBe(true);
    expect(isNotEntirelyBold(render('<p><strong>a</strong><em>b</em></p>'))).toBe(true);
  });

  it('is true without visible text', () => {
    expect(isNotEntirelyBold(render('<p></p>'))).toBe(true);
    expect(isNotEntirelyBold(render('<p> </p>'))).toBe(true);
    expect(isNotEntirelyBold(render('<p><strong> </strong></p>'))).toBe(true);
  });

  it('is true for plain text', () => {
    expect(isNotEntirelyBold(render('<p>plain</p>'))).toBe(true);
  });
});
