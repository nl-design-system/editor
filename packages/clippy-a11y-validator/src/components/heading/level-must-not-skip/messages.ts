import type { ValidationMessagesByLocale } from '../../../types/messages.ts';

export const messages: ValidationMessagesByLocale = {
  nl: {
    error: 'Kopniveau {headingLevel} volgt direct op kopniveau {precedingHeadingLevel}.',
    href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/koppen/#kopniveaus',
    solution: 'Gebruik kopniveau {expectedHeadingLevel}, zodat er geen kopniveau wordt overgeslagen.',
  },
};
