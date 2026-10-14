import { describe, expect, it } from 'vitest';
import { initializeRuleTest } from '../../../test-helpers/initialize-rule-test.ts';
import { linkShouldNotBeTooGeneric } from './index.ts';

const { validate } = initializeRuleTest([linkShouldNotBeTooGeneric]);

describe('linkShouldNotBeTooGeneric', () => {
  it('flags "lees meer"', () => {
    const [violation] = validate('<p><a href="/paspoort">lees meer</a></p>');

    expect(violation?.rule).toBe('LINK_SHOULD_NOT_BE_TOO_GENERIC');
    expect(violation?.severity).toBe('info');
    expect(violation?.scope).toBe('element');
    expect(violation?.messages.title).toBe('De linktekst geeft niet voldoende informatie');
    expect(violation?.messages.explanation).toBe(
      '<p class="nl-paragraph">De linktekst <strong>lees meer</strong> zegt niet waar de link naartoe gaat.</p>',
    );
    expect(violation?.messages.solution).toBe(
      '<p class="nl-paragraph">Zorg ervoor dat de linktekst beschrijft waar de bezoeker naartoe gaat.</p>',
    );
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
    expect(validate('<p><a href="/paspoort">lees meer</a></p>')[0]).not.toHaveProperty('correction');
  });
});
