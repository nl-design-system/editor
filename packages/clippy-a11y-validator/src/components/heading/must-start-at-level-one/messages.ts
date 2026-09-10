import type { ValidationMessagesByLocale } from '../../../types/messages.ts';

export const messages: ValidationMessagesByLocale = {
  en: {
    error: 'The document starts at heading level {headingLevel} instead of heading level {topHeadingLevel}.',
    href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/koppen',
    solution: 'Turn this heading into a heading level {topHeadingLevel}.',
  },
  nl: {
    error: 'Het document begint met kopniveau {headingLevel} in plaats van kopniveau {topHeadingLevel}.',
    href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/koppen',
    solution: 'Maak van deze kop een kopniveau {topHeadingLevel}.',
  },
};
