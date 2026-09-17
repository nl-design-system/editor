import { beforeEach, describe, expect, it } from 'vitest';
import { Validator } from '../../../validator.ts';
import { linkShouldNotBeEmpty } from './index.ts';

let root: HTMLElement;
const validator = new Validator({ validations: [linkShouldNotBeEmpty] });

const validate = (html: string) => {
  root.innerHTML = html;
  return validator.validate(root);
};

beforeEach(() => {
  root = document.createElement('div');
  document.body.replaceChildren(root);
});

describe('linkShouldNotBeEmpty', () => {
  it('flags a link without link text', () => {
    const [violation] = validate('<p><a href="/paspoort"></a></p>');

    expect(violation?.rule).toBe('LINK_SHOULD_NOT_BE_EMPTY');
    expect(violation?.severity).toBe('warning');
    expect(violation?.scope).toBe('inline');
    expect(violation?.messages.error).toBe('Deze link heeft geen linktekst.');
    expect(violation?.messages.solution).toBe('Verwijder de lege link of voeg linktekst toe.');
  });

  it('flags a link holding only whitespace', () => {
    expect(validate('<p><a href="/paspoort"> </a></p>')).toHaveLength(1);
  });

  it('accepts a link with text', () => {
    expect(validate('<p><a href="/paspoort">Paspoort aanvragen</a></p>')).toHaveLength(0);
  });

  it('accepts a link whose text is nested in an inline element', () => {
    expect(validate('<p><a href="/paspoort"><strong>Paspoort aanvragen</strong></a></p>')).toHaveLength(0);
  });

  it('ignores elements that are not links', () => {
    expect(validate('<p><span></span></p>')).toHaveLength(0);
  });

  it('removes the link when corrected', () => {
    const [violation] = validate('<p>Zie <a href="/paspoort"></a>hier</p>');
    violation?.correct?.();

    expect(root.querySelector('p')?.innerHTML).toBe('Zie hier');
    expect(validator.validate(root)).toHaveLength(0);
  });
});
