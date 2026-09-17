import { beforeEach, describe, expect, it } from 'vitest';
import { Validator } from '../../../validator.ts';
import { headingMustNotBeEmpty } from './index.ts';

let root: HTMLElement;
const validator = new Validator({ validations: [headingMustNotBeEmpty] });

const validate = (html: string) => {
  root.innerHTML = html;
  return validator.validate(root);
};

beforeEach(() => {
  root = document.createElement('div');
  document.body.replaceChildren(root);
});

describe('headingMustNotBeEmpty', () => {
  it('flags an empty heading', () => {
    const [violation] = validate('<h2></h2>');

    expect(violation?.rule).toBe('HEADING_MUST_NOT_BE_EMPTY');
    expect(violation?.severity).toBe('error');
    expect(violation?.scope).toBe('block');
    expect(violation?.messages.error).toBe('Deze kop is leeg.');
    expect(violation?.messages.solution).toBe('Verwijder de lege kop of voeg tekst toe.');
  });

  it('flags an empty heading at every level', () => {
    expect(validate('<h1></h1><h2></h2><h3></h3><h4></h4><h5></h5><h6></h6>')).toHaveLength(6);
  });

  it('flags a heading that contains only whitespace', () => {
    expect(validate('<h1>   </h1>')).toHaveLength(1);
  });

  it('flags a heading that contains only a line break', () => {
    expect(validate('<h1><br></h1>')).toHaveLength(1);
  });

  it('flags a heading whose only child is an empty inline element', () => {
    expect(validate('<h1><strong></strong></h1>')).toHaveLength(1);
  });

  it('accepts a heading with text', () => {
    expect(validate('<h1>Titel</h1>')).toHaveLength(0);
  });

  it('accepts a heading whose text is nested in an inline element', () => {
    expect(validate('<h1><strong>Titel</strong></h1>')).toHaveLength(0);
  });

  it('ignores elements that are not headings', () => {
    expect(validate('<p></p><div></div>')).toHaveLength(0);
  });

  it('links to the heading guidance', () => {
    expect(validate('<h1></h1>')[0]?.messages.href).toContain('nldesignsystem.nl');
  });

  it('removes the heading when corrected', () => {
    const [violation] = validate('<h1></h1><p>tekst</p>');
    violation?.correct?.();

    expect(root.innerHTML).toBe('<p>tekst</p>');
    expect(validator.validate(root)).toHaveLength(0);
  });
});
