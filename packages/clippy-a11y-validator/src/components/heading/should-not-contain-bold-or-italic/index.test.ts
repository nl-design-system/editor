import { beforeEach, describe, expect, it } from 'vitest';
import { Validator } from '../../../validator.ts';
import { headingShouldNotContainBoldOrItalic } from './index.ts';

let root: HTMLElement;
const validator = new Validator({ validations: [headingShouldNotContainBoldOrItalic] });

const validate = (html: string) => {
  root.innerHTML = html;
  return validator.validate(root);
};

beforeEach(() => {
  root = document.createElement('div');
  document.body.replaceChildren(root);
});

describe('headingShouldNotContainBoldOrItalic', () => {
  it('flags a heading that contains bold text', () => {
    const [violation] = validate('<h2>Kop met <strong>nadruk</strong></h2>');

    expect(violation?.rule).toBe('HEADING_SHOULD_NOT_CONTAIN_BOLD_OR_ITALIC');
    expect(violation?.severity).toBe('info');
    expect(violation?.scope).toBe('block');
    expect(violation?.messages.error).toBe('Deze kop bevat vetgedrukte of cursieve tekst.');
    expect(violation?.messages.solution).toContain('Verwijder de vetgedrukte of cursieve opmaak');
  });

  it('flags a heading that contains italic text', () => {
    expect(validate('<h2>Kop met <em>nadruk</em></h2>')).toHaveLength(1);
  });

  it('flags every bold and italic tag', () => {
    expect(validate('<h1><b>a</b></h1><h1><strong>b</strong></h1><h1><i>c</i></h1><h1><em>d</em></h1>')).toHaveLength(
      4,
    );
  });

  it('flags formatting nested deeper in the heading', () => {
    expect(validate('<h2><span><strong>nadruk</strong></span></h2>')).toHaveLength(1);
  });

  it('accepts a heading with only plain text', () => {
    expect(validate('<h2>Gewone kop</h2>')).toHaveLength(0);
  });

  it('accepts a heading with other inline elements', () => {
    expect(validate('<h2>Kop met <code>code</code></h2>')).toHaveLength(0);
  });

  it('ignores formatting outside a heading', () => {
    expect(validate('<p><strong>nadruk</strong></p>')).toHaveLength(0);
  });

  it('unwraps the formatting when corrected, keeping the text', () => {
    const [violation] = validate('<h2>Kop met <strong>nadruk</strong> en <em>cursief</em></h2>');
    violation?.correct?.();

    expect(root.querySelector('h2')?.innerHTML).toBe('Kop met nadruk en cursief');
    expect(validator.validate(root)).toHaveLength(0);
  });
});
