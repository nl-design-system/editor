import type { ValidationMessagesByLocale } from '../../../types/messages.ts';

export const messages: ValidationMessagesByLocale = {
  en: {
    error: 'These lines start with "{prefix}" and form a list that is not marked up as a list.',
    href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/opsommingen/#genummerde-en-ongenummerde-lijsten',
    solution: 'Use a real list instead of lines starting with "{prefix}".',
  },
  nl: {
    error: 'Deze regels beginnen met "{prefix}" en vormen een lijst die niet als lijst is opgemaakt.',
    href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/opsommingen/#genummerde-en-ongenummerde-lijsten',
    solution: 'Gebruik een echte opsomming in plaats van regels die met "{prefix}" beginnen.',
  },
};
