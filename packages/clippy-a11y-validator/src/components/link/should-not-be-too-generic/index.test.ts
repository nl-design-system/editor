import { beforeEach, describe, expect, it } from 'vitest';
import { Validator } from '../../../validator.ts';
import { linkShouldNotBeTooGeneric } from './index.ts';

let root: HTMLElement;
const validator = new Validator({ validations: [linkShouldNotBeTooGeneric] });

const validate = (html: string) => {
  root.innerHTML = html;
  return validator.validate(root);
};

beforeEach(() => {
  root = document.createElement('div');
  document.body.replaceChildren(root);
});

describe('linkShouldNotBeTooGeneric', () => {
  it('flags "lees meer"', () => {
    const [violation] = validate('<p><a href="/paspoort">lees meer</a></p>');

    expect(violation?.rule).toBe('LINK_SHOULD_NOT_BE_TOO_GENERIC');
    expect(violation?.severity).toBe('info');
    expect(violation?.scope).toBe('inline');
    expect(violation?.messages.error).toBe('De linktekst "lees meer" zegt niet waar de link naartoe gaat.');
    expect(violation?.messages.solution).toBe('Beschrijf in de linktekst waar de link naartoe gaat.');
  });

  it('flags "klik hier"', () => {
    expect(validate('<p><a href="/paspoort">klik hier</a></p>')).toHaveLength(1);
  });

  it('ignores casing and surrounding whitespace', () => {
    expect(validate('<p><a href="/a"> Lees Meer </a><a href="/b">KLIK HIER</a></p>')).toHaveLength(2);
  });

  it('reports the original text in the payload', () => {
    expect(validate('<p><a href="/paspoort">Lees Meer</a></p>')[0]?.payload).toEqual({ text: 'Lees Meer' });
  });

  it('accepts a descriptive link text', () => {
    expect(validate('<p><a href="/paspoort">Paspoort aanvragen</a></p>')).toHaveLength(0);
  });

  it('accepts a link text that merely contains a generic phrase', () => {
    expect(validate('<p><a href="/paspoort">Lees meer over paspoorten</a></p>')).toHaveLength(0);
  });

  it('ignores elements that are not links', () => {
    expect(validate('<p>lees meer</p>')).toHaveLength(0);
  });

  it('offers no correction, because the replacement text has to be written by the author', () => {
    expect(validate('<p><a href="/paspoort">lees meer</a></p>')[0]?.correct).toBeUndefined();
  });
});
