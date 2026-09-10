import type { ValidationMessagesByLocale } from '../../../types/messages.ts';

export const messages: ValidationMessagesByLocale = {
  en: {
    error: 'The link text "{text}" does not say where the link goes.',
    href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/linkteksten/',
    solution: 'Describe in the link text where the link goes.',
  },
  nl: {
    error: 'De linktekst "{text}" zegt niet waar de link naartoe gaat.',
    href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/linkteksten/',
    solution: 'Beschrijf in de linktekst waar de link naartoe gaat.',
  },
};
