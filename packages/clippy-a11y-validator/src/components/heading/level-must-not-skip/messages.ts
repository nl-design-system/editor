import type { ValidationMessagesByLocale } from '../../../types/messages.ts';

export const messages: ValidationMessagesByLocale = {
  en: {
    error: 'Heading level {headingLevel} directly follows heading level {precedingHeadingLevel}.',
    href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/koppen/#kopniveaus',
    solution: 'Use heading level {expectedHeadingLevel}, so no heading level is skipped.',
  },
  nl: {
    error: 'Kopniveau {headingLevel} volgt direct op kopniveau {precedingHeadingLevel}.',
    href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/koppen/#kopniveaus',
    solution: 'Gebruik kopniveau {expectedHeadingLevel}, zodat er geen kopniveau wordt overgeslagen.',
  },
};
