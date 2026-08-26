import { describe, expect, it } from 'vitest';
import { headingValidations, richTextContentValidations, tableValidations } from '@/constants';
import { runValidation } from '@/detection';
import { translator, validationContext } from '@/i18n';
import { validationKeys, validationMessages } from '@/messages';

const body = (html: string): HTMLElement => new DOMParser().parseFromString(html, 'text/html').body;

const solutionOf = (html: string, key: string, locale?: 'en' | 'nl') =>
  runValidation(body(html), { enableRules: ['*'], locale }).find((r) => r.validatorKey === key)?.solution;

describe('catalogue', () => {
  it('has an English and a Dutch heading for every rule', () => {
    const en = translator('en');
    const nl = translator('nl');
    for (const key of validationKeys) {
      expect(en(`${key}.heading`), key).toBeTruthy();
      expect(nl(`${key}.heading`), key).toBeTruthy();
    }
  });

  it('falls back to English when no locale is given', () => {
    expect(translator()(`${headingValidations.HEADING_MUST_NOT_BE_EMPTY}.heading`)).toBe('Heading must not be empty');
  });

  it('returns undefined for a rule that ships no solution', () => {
    expect(translator('en')(`${tableValidations.TABLE_MUST_HAVE_MULTIPLE_ROWS}.solution`)).toBeUndefined();
  });

  it('returns undefined for an unknown node type, so callers can fall back', () => {
    expect(translator('en')('nodeTypes.somethingElse')).toBeUndefined();
  });

  it('keeps the untranslated guidance link alongside the translated heading', () => {
    const nl = validationMessages('nl')[headingValidations.HEADING_MUST_NOT_BE_EMPTY];
    expect(nl.heading).toBe('Koptekst mag niet leeg zijn');
    expect(nl.href).toContain('nldesignsystem.nl');
  });
});

describe('validationContext', () => {
  it('binds its translator to the settings locale', () => {
    expect(validationContext({ enableRules: ['*'], locale: 'nl' }).t('nodeTypes.paragraph')).toBe('paragraaf');
    expect(validationContext({ enableRules: ['*'] }).t('nodeTypes.paragraph')).toBe('paragraph');
  });

  it('keeps the settings it was built from, so validators read both from one object', () => {
    const context = validationContext({ enableRules: ['*'], topHeadingLevel: 3 });
    expect(context.topHeadingLevel).toBe(3);
    expect(context.t).toBeTypeOf('function');
  });
});

describe('translated solutions', () => {
  it('interpolates a node type in the run locale', () => {
    const html = '<table><tr><td></td><td>x</td></tr><tr><td>y</td><td>z</td></tr></table>';
    expect(solutionOf(html, richTextContentValidations.NODE_SHOULD_NOT_BE_EMPTY, 'en')).toBe(
      'Remove the empty **table cell** or add text.',
    );
    expect(solutionOf(html, richTextContentValidations.NODE_SHOULD_NOT_BE_EMPTY, 'nl')).toBe(
      'Verwijder de lege **tabelcel** of voeg tekst toe.',
    );
  });

  it('builds a localised list of allowed heading levels', () => {
    const html = '<h1>a</h1><h2>b</h2><h3>c</h3><h6>d</h6>';
    expect(solutionOf(html, headingValidations.DOCUMENT_MUST_HAVE_CORRECT_HEADING_ORDER, 'en')).toBe(
      '**Heading level 6** must not directly follow a **heading level 3**. Use heading level 2, 3, or 4.',
    );
    expect(solutionOf(html, headingValidations.DOCUMENT_MUST_HAVE_CORRECT_HEADING_ORDER, 'nl')).toBe(
      '**Kopniveau 6** mag niet direct volgen op een **kopniveau 3**. Gebruik kopniveau 2, 3 of 4.',
    );
  });

  it('does not leak one run’s locale into the next', () => {
    const html = '<p>text <u>underlined</u></p>';
    expect(solutionOf(html, 'INLINE_SHOULD_NOT_BE_UNDERLINED', 'nl')).toBe('Verwijder de onderstreping van de tekst.');
    expect(solutionOf(html, 'INLINE_SHOULD_NOT_BE_UNDERLINED')).toBe('Remove the underline from the text.');
  });
});
