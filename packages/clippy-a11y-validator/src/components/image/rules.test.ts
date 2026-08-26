import { parseAndSelect } from '@test/dom-fixtures';
import { describe, expect, it } from 'vitest';
import { isMissingAltText } from './rules';

const image = (html: string): Element => parseAndSelect(html, 'img');

describe('isMissingAltText', () => {
  it('flags an image with no alt attribute', () => {
    expect(isMissingAltText(image('<img src="cat.png">'))).toBe(true);
  });

  it('flags an image with an empty alt attribute', () => {
    expect(isMissingAltText(image('<img src="cat.png" alt="">'))).toBe(true);
  });

  it('flags an image whose alt holds only whitespace', () => {
    expect(isMissingAltText(image('<img src="cat.png" alt="   ">'))).toBe(true);
  });

  it('accepts an image with a description', () => {
    expect(isMissingAltText(image('<img src="cat.png" alt="A sleeping cat">'))).toBe(false);
  });

  it('ignores a non-image', () => {
    expect(isMissingAltText(parseAndSelect('<div></div>', 'div'))).toBe(false);
  });
});
