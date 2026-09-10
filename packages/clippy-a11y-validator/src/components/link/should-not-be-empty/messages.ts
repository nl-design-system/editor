import type { ValidationMessagesByLocale } from '../../../types/messages.ts';

export const messages: ValidationMessagesByLocale = {
  en: {
    error: 'This link has no link text.',
    href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/linkteksten/',
    solution: 'Remove the empty link or add link text.',
  },
  nl: {
    error: 'Deze link heeft geen linktekst.',
    href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/linkteksten/',
    solution: 'Verwijder de lege link of voeg linktekst toe.',
  },
};
