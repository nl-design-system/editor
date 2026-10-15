import type { ValidationMessagesByLocale } from '../../../types/messages.ts';

export const messages: ValidationMessagesByLocale = {
  nl: {
    explanation:
      '<p class="nl-paragraph">Deze regels beginnen met <strong>{prefix}</strong> en vormen een lijst die niet als lijst is opgemaakt.</p>',
    href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/opsommingen/#genummerde-en-ongenummerde-lijsten',
    solution:
      '<p class="nl-paragraph">Gebruik een echte opsomming in plaats van regels die met "{prefix}" beginnen.</p>',
    title: 'Lijst gevonden zonder lijstopmaak',
  },
};
