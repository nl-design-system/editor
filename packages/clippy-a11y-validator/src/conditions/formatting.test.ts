import { describe, expect, it } from 'vitest';
import { render } from '../test-helpers/render.ts';
import { isEntirelyBold } from './formatting.ts';

describe('isEntirelyBold', () => {
  it('is true when all text sits inside bold elements', () => {
    expect(isEntirelyBold(render('<p><strong>a</strong></p>'))).toBe(true);
    expect(isEntirelyBold(render('<p><b>a</b></p>'))).toBe(true);
    expect(isEntirelyBold(render('<p><strong>a</strong> <b>b</b></p>'))).toBe(true);
  });

  it('is true when the bold element sits inside another inline wrapper', () => {
    expect(isEntirelyBold(render('<p><em><strong>a</strong></em></p>'))).toBe(true);
    expect(isEntirelyBold(render('<p><span class="x"><strong>a</strong></span></p>'))).toBe(true);
  });

  it('is false when text sits outside the bold elements', () => {
    expect(isEntirelyBold(render('<p><strong>a</strong> and more</p>'))).toBe(false);
    expect(isEntirelyBold(render('<p><strong>a</strong><em>b</em></p>'))).toBe(false);
  });

  it('is false without visible text', () => {
    expect(isEntirelyBold(render('<p></p>'))).toBe(false);
    expect(isEntirelyBold(render('<p> </p>'))).toBe(false);
    expect(isEntirelyBold(render('<p><strong> </strong></p>'))).toBe(false);
  });

  it('is false for plain text', () => {
    expect(isEntirelyBold(render('<p>plain</p>'))).toBe(false);
  });
});
