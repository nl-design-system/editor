import type { ValidationMessagesByLocale } from '../../../types/messages.ts';

export const messages: ValidationMessagesByLocale = {
  nl: {
    explanation:
      '<p class="nl-paragraph">Het document begint met kopniveau <strong>{headingLevel}</strong> in plaats van kopniveau 1.</p>',
    href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/koppen',
    solution: '<p class="nl-paragraph">Maak van deze kop een kopniveau 1.</p>',
    title: 'Het document begint niet met kopniveau 1',
  },
};
