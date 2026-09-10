import type { ValidationMessagesByLocale } from '../../../types/messages.ts';

export const messages: ValidationMessagesByLocale = {
  en: {
    error: 'This document has more than one heading level 1.',
    href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/koppen',
    solution: 'Use heading level 1 only for the document title and turn this heading into a heading level 2.',
  },
  nl: {
    error: 'Dit document heeft meer dan één kopniveau 1.',
    href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/koppen',
    solution: 'Gebruik kopniveau 1 alleen voor de titel van het document en maak van deze kop een kopniveau 2.',
  },
};
