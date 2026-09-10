import type { ValidationMessagesByLocale } from '../../../types/messages.ts';

export const messages: ValidationMessagesByLocale = {
  en: {
    error: 'Heading level {headingLevel} is above the highest heading level this document may use.',
    href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/koppen/#kopniveaus',
    solution: 'Use heading level {topHeadingLevel} or deeper.',
  },
  nl: {
    error: 'Kopniveau {headingLevel} ligt boven het hoogste kopniveau dat dit document mag gebruiken.',
    href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/koppen/#kopniveaus',
    solution: 'Gebruik kopniveau {topHeadingLevel} of lager.',
  },
};
