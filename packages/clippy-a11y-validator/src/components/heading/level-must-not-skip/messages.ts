import type { ValidationMessagesByLocale } from '../../../types/messages.ts';

export const messages: ValidationMessagesByLocale = {
  nl: {
    explanation:
      '<p class="nl-paragraph">Kopniveau <strong>{headingLevel}</strong> volgt direct op kopniveau <strong>{precedingHeadingLevel}</strong></p>',
    href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/koppen/#kopniveaus',
    solution:
      '<p class="nl-paragraph">Gebruik kopniveau <strong>{expectedHeadingLevel}</strong>, zodat er geen kopniveau wordt overgeslagen.</p>',
  },
};
