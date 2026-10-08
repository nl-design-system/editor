import { describe, expect, it } from 'vitest';
import { documentationSections } from './documentation';

/** "Hele alinea is dikgedrukt": the one rule carrying several alternative solutions. */
const ENTIRELY_BOLD = 'd9c53eaf-16dd-42eb-bcc4-7d9f97283309';
/** "De tekst heeft een te laag contrast": the one rule carrying related guidelines. */
const LOW_CONTRAST = '6d61fe26-eda8-40b7-898f-a84ba58562f6';

describe('documentationSections', () => {
  it('explains the rule before it solves it', () => {
    expect(documentationSections(ENTIRELY_BOLD)[0]).toContain('De hele alinea is dikgedrukt.');
  });

  it('keeps every alternative solution the rule offers, in the order the documentation lists them', () => {
    expect(documentationSections(ENTIRELY_BOLD).map((section) => section.replace(/<[^>]*>/g, ''))).toEqual([
      expect.stringContaining('De hele alinea is dikgedrukt.'),
      expect.stringContaining('Wil je een kop toevoegen boven een sectie?'),
      expect.stringContaining('omdat het de introductietekst is?'),
      expect.stringContaining('alleen voor de woorden of zinnen die extra aandacht nodig hebben'),
    ]);
  });

  it('puts the related guidelines last, after the solution', () => {
    expect(documentationSections(LOW_CONTRAST).at(-1)).toContain('NL Design System richtlijnen:');
    expect(documentationSections(LOW_CONTRAST).at(-2)).toContain('Pas de kleur van de tekst of achtergrond aan');
  });

  it('leaves the rule out of its own sections', () => {
    expect(documentationSections(ENTIRELY_BOLD).join('')).not.toContain(ENTIRELY_BOLD);
  });

  it('has nothing to say about a rule the documentation does not describe', () => {
    expect(documentationSections('00000000-0000-0000-0000-000000000000')).toEqual([]);
  });

  it('has nothing to say about a validation that names no rule', () => {
    expect(documentationSections()).toEqual([]);
  });
});
