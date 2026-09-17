import { beforeEach, describe, expect, it } from 'vitest';
import { Validator } from '../../../validator.ts';
import { tableCaptionShouldNotBeEmpty } from './index.ts';

let root: HTMLElement;
const validator = new Validator({ validations: [tableCaptionShouldNotBeEmpty] });

const validate = (html: string) => {
  root.innerHTML = html;
  return validator.validate(root);
};

beforeEach(() => {
  root = document.createElement('div');
  document.body.replaceChildren(root);
});

describe('tableCaptionShouldNotBeEmpty', () => {
  it('flags an empty caption', () => {
    const [violation] = validate('<table><caption></caption><tbody><tr><td>C1</td></tr></tbody></table>');

    expect(violation?.rule).toBe('TABLE_CAPTION_SHOULD_NOT_BE_EMPTY');
    expect(violation?.severity).toBe('info');
    expect(violation?.scope).toBe('block');
    expect(violation?.messages.error).toBe('Deze tabel heeft een lege omschrijving.');
  });

  it('flags a caption holding only whitespace', () => {
    expect(validate('<table><caption> </caption></table>')).toHaveLength(1);
  });

  it('accepts a caption with content', () => {
    expect(validate('<table><caption>Kosten per jaar</caption></table>')).toHaveLength(0);
  });

  it('does not report a table without a caption', () => {
    expect(validate('<table><tbody><tr><td>C1</td></tr></tbody></table>')).toHaveLength(0);
  });

  it('offers no correction, because the caption should be filled in rather than removed', () => {
    expect(validate('<table><caption></caption></table>')[0]?.correct).toBeUndefined();
  });
});
