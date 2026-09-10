import type { ValidationMessagesByLocale } from '../../../types/messages.ts';

export const messages: ValidationMessagesByLocale = {
  en: {
    error: 'This heading contains bold or italic text.',
    href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/koppen/#opmaak-van-koppen',
    solution: 'Remove the bold or italic formatting from the text in the heading.',
  },
  nl: {
    error: 'Deze kop bevat vetgedrukte of cursieve tekst.',
    href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/koppen/#opmaak-van-koppen',
    solution: 'Verwijder de vetgedrukte of cursieve opmaak uit de tekst in de kop.',
  },
};
