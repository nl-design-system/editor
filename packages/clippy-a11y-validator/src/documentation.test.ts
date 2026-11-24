import { describe, expect, it } from 'vitest';
import { getDocumentationComponentRuleById } from './documentation.ts';

describe('getDocumentationComponentRuleById', () => {
  it('returns undefined without an id', () => {
    expect(getDocumentationComponentRuleById()).toBeUndefined();
  });

  it('takes the html of a single solution', () => {
    // Paragraph: Alinea heeft geen inhoud
    expect(getDocumentationComponentRuleById('a023d975-1365-4057-bb23-d4c23bb52784')?.solutions).toEqual([
      '<p class="nl-paragraph">Verwijder de lege alinea.</p>',
    ]);
  });

  it('takes the html of every solution, in order', () => {
    // Heading: Kop heeft geen inhoud
    expect(getDocumentationComponentRuleById('c4ef9fcd-016e-4f8f-aea7-6f7e5bcd6fe2')?.solutions).toEqual([
      '<p class="nl-paragraph">Verwijder de lege kop.</p>',
      '<p class="nl-paragraph">Voeg een duidelijke koptekst toe.</p>',
    ]);
  });

  describe('with a solution order', () => {
    // Heading: Kop gebruikt voor grotere tekst, maar de tekst is geen kop
    const id = '586da28e-8e70-4844-a0dd-61eb4ecd7017';
    const paragraph = '<p class="nl-paragraph">Verander de kop in een gewone alinea.</p>';
    const quote =
      '<p class="nl-paragraph">Wil je een tekst uitlichten omdat het een citaat is? Gebruik dan een citaatblok.</p>';

    it('puts the named solutions first, in the given order', () => {
      expect(getDocumentationComponentRuleById(id, ['9b40ed7f-74d9-46df-8e0c-fa87582a05c0'])?.solutions).toEqual([
        quote,
        paragraph,
      ]);
    });

    it('ignores ids the rule does not have', () => {
      expect(getDocumentationComponentRuleById(id, ['unknown'])?.solutions).toEqual([paragraph, quote]);
    });
  });
});
