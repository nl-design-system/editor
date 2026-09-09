import { beforeEach, describe, expect, it } from 'vitest';
import { Validator } from '../../../validator.ts';
import { emphasisShouldNotBeUnderlined } from './index.ts';

let root: HTMLElement;
const validator = new Validator({ validations: [emphasisShouldNotBeUnderlined] });

const validate = (html: string) => {
  root.innerHTML = html;
  return validator.validate(root);
};

beforeEach(() => {
  root = document.createElement('div');
  document.body.replaceChildren(root);
});

describe('emphasisShouldNotBeUnderlined', () => {
  it('flags underlined text', () => {
    const [violation] = validate('<p><u>onderstreept</u></p>');

    expect(violation?.rule).toBe('EMPHASIS_SHOULD_NOT_BE_UNDERLINED');
    expect(violation?.severity).toBe('info');
    expect(violation?.scope).toBe('inline');
    expect(violation?.messages.error).toBe('Deze tekst is onderstreept. Dat lijkt te veel op een link.');
    expect(violation?.messages.solution).toBe('Verwijder de onderstreping van de tekst.');
  });

  it('flags an underline regardless of its content', () => {
    expect(validate('<p><u></u></p><p><u> </u></p><p><u>tekst</u></p>')).toHaveLength(3);
  });

  it('flags every underline in the document', () => {
    expect(validate('<p><u>een</u> en <u>twee</u></p>')).toHaveLength(2);
  });

  it('ignores other kinds of emphasis', () => {
    expect(validate('<p><strong>dik</strong><em>cursief</em><s>door</s></p>')).toHaveLength(0);
  });

  it('links to the guidance on underlining', () => {
    expect(validate('<p><u>tekst</u></p>')[0]?.messages.href).toContain('#onderstrepen');
  });

  it('unwraps the underline when corrected, keeping the text', () => {
    const [violation] = validate('<p>Zie <u>onderstreept</u> hier</p>');
    violation?.correct?.();

    expect(root.querySelector('p')?.innerHTML).toBe('Zie onderstreept hier');
    expect(validator.validate(root)).toHaveLength(0);
  });
});
