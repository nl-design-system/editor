import { beforeEach, describe, expect, it } from 'vitest';
import { Validator } from '../../../validator.ts';
import { imageMustHaveAltText } from './index.ts';

let root: HTMLElement;
const validator = new Validator({ validations: [imageMustHaveAltText] });

const validate = (html: string) => {
  root.innerHTML = html;
  return validator.validate(root);
};

beforeEach(() => {
  root = document.createElement('div');
  document.body.replaceChildren(root);
});

describe('imageMustHaveAltText', () => {
  it('flags an image without an alt attribute', () => {
    const [violation] = validate('<p><img src="paspoort.png"></p>');

    expect(violation?.rule).toBe('IMAGE_MUST_HAVE_ALT_TEXT');
    expect(violation?.severity).toBe('info');
    expect(violation?.scope).toBe('block');
    expect(violation?.messages.error).toBe('Deze afbeelding heeft geen alternatieve tekst.');
    expect(violation?.messages.solution).toContain('Beschrijf in de alternatieve tekst');
  });

  it('flags an image with an empty alt attribute', () => {
    expect(validate('<p><img src="paspoort.png" alt=""></p>')).toHaveLength(1);
  });

  it('flags an image whose alt attribute is only whitespace', () => {
    expect(validate('<p><img src="paspoort.png" alt="  "></p>')).toHaveLength(1);
  });

  it('accepts an image with a descriptive alt attribute', () => {
    expect(validate('<p><img src="paspoort.png" alt="Een Nederlands paspoort"></p>')).toHaveLength(0);
  });

  it('flags every image without alt text', () => {
    expect(
      validate('<p><img src="a.png"><img src="b.png" alt="Beschrijving"><img src="c.png" alt=""></p>'),
    ).toHaveLength(2);
  });

  it('ignores elements that are not images', () => {
    expect(validate('<p><svg></svg></p>')).toHaveLength(0);
  });

  it('offers no correction, because only the author knows what the image conveys', () => {
    expect(validate('<p><img src="paspoort.png"></p>')[0]?.correct).toBeUndefined();
  });
});
