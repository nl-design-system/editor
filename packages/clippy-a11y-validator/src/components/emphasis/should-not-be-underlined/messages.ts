import type { ValidationMessagesByLocale } from '../../../types/messages.ts';

export const messages: ValidationMessagesByLocale = {
  en: {
    error: 'This text is underlined. That looks too much like a link.',
    href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/tekst-benadrukken/#onderstrepen',
    solution: 'Remove the underline from the text.',
  },
  nl: {
    error: 'Deze tekst is onderstreept. Dat lijkt te veel op een link.',
    href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/tekst-benadrukken/#onderstrepen',
    solution: 'Verwijder de onderstreping van de tekst.',
  },
};
