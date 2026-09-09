import { beforeEach, describe, expect, it } from 'vitest';
import { Validator } from '../../../validator.ts';
import { emphasisShouldNotBeEmpty } from './index.ts';

let root: HTMLElement;
const validator = new Validator({ validations: [emphasisShouldNotBeEmpty] });

const validate = (html: string) => {
  root.innerHTML = html;
  return validator.validate(root);
};

beforeEach(() => {
  root = document.createElement('div');
  document.body.replaceChildren(root);
});

describe('emphasisShouldNotBeEmpty', () => {
  it('flags an empty bold element', () => {
    const [violation] = validate('<p><strong></strong></p>');

    expect(violation?.rule).toBe('EMPHASIS_SHOULD_NOT_BE_EMPTY');
    expect(violation?.severity).toBe('warning');
    expect(violation?.scope).toBe('inline');
    expect(violation?.messages.error).toBe('Dit opmaakelement is leeg.');
  });

  it('tailors the solution to the kind of emphasis', () => {
    const cases: [string, string][] = [
      ['<p><strong></strong></p>', 'Verwijder de lege vetgedrukte tekst.'],
      ['<p><b></b></p>', 'Verwijder de lege vetgedrukte tekst.'],
      ['<p><em></em></p>', 'Verwijder de lege cursieve tekst.'],
      ['<p><i></i></p>', 'Verwijder de lege cursieve tekst.'],
      ['<p><code></code></p>', 'Verwijder de lege code.'],
      ['<p><mark></mark></p>', 'Verwijder de lege markering.'],
      ['<p><s></s></p>', 'Verwijder de lege doorgehaalde tekst.'],
      ['<p><del></del></p>', 'Verwijder de lege doorgehaalde tekst.'],
      ['<p><u></u></p>', 'Verwijder de lege onderstreepte tekst.'],
    ];

    expect(cases.map(([html]) => validate(html)[0]?.messages.solution)).toEqual(cases.map(([, solution]) => solution));
  });

  it('reports the kind of emphasis as the payload variant', () => {
    expect(validate('<p><mark></mark></p>')[0]?.payload).toEqual({ variant: 'highlight' });
  });

  it('flags an element holding only whitespace', () => {
    expect(validate('<p><strong> </strong></p>')).toHaveLength(1);
  });

  it('accepts an element with text', () => {
    expect(validate('<p><strong>nadruk</strong></p>')).toHaveLength(0);
  });

  it('does not flag links, which have their own rule', () => {
    expect(validate('<p><a href="/a"></a></p>')).toHaveLength(0);
  });

  it('ignores elements that carry no emphasis', () => {
    expect(validate('<p><span></span></p>')).toHaveLength(0);
  });

  it('removes the element when corrected', () => {
    const [violation] = validate('<p>Zie <strong></strong>hier</p>');
    violation?.correct?.();

    expect(root.querySelector('p')?.innerHTML).toBe('Zie hier');
    expect(validator.validate(root)).toHaveLength(0);
  });
});
