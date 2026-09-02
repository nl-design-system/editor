import { beforeEach, describe, expect, it } from 'vitest';
import { Validator } from '../../../validator.ts';
import { paragraphShouldNotBeEntirelyBold } from './index.ts';

let root: HTMLElement;
const validator = new Validator({ validations: [paragraphShouldNotBeEntirelyBold] });

const validate = (html: string) => {
  root.innerHTML = html;
  return validator.validate(root);
};

beforeEach(() => {
  root = document.createElement('div');
  document.body.replaceChildren(root);
});

describe('paragraphShouldNotBeEntirelyBold', () => {
  it('flags a paragraph that is entirely bold', () => {
    const [violation] = validate('<p><strong>Alles dik</strong></p>');

    expect(violation?.code).toBe('PARAGRAPH_SHOULD_NOT_BE_ENTIRELY_BOLD');
    expect(violation?.severity).toBe('warning');
    expect(violation?.scope).toBe('block');
    expect(violation?.messages.error).toBe('De hele alinea is dikgedrukt.');
    expect(violation?.messages.solution).toContain('alleen voor de woorden');
  });

  it('accepts a paragraph with bold and plain text', () => {
    expect(validate('<p><strong>Dik</strong> en gewoon</p>')).toHaveLength(0);
  });

  it('accepts an empty paragraph', () => {
    expect(validate('<p> </p>')).toHaveLength(0);
  });

  it('flags a paragraph whose bold text is wrapped in another inline element', () => {
    expect(validate('<p><em><strong>Alles dik</strong></em></p>')).toHaveLength(1);
  });

  it('ignores elements that are not paragraphs', () => {
    expect(validate('<div><strong>Alles dik</strong></div>')).toHaveLength(0);
  });

  it('unwraps the bold children when corrected', () => {
    const [violation] = validate('<p><strong>Alles</strong> <b>dik</b></p>');
    violation?.correct?.();

    expect(root.querySelector('p')?.innerHTML).toBe('Alles dik');
    expect(validator.validate(root)).toHaveLength(0);
  });
});
