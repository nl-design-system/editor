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
});
