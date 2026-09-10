import type { ValidationMessagesByLocale } from '../../../types/messages.ts';

// Copied from @nl-design-system-unstable/documentation componenten/paragraph/_issues/strong.
export const messages: ValidationMessagesByLocale = {
  en: {
    error: 'The whole paragraph is bold.',
    href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/tekst-benadrukken/',
    solution: 'Use bold text only for the words or sentences that need extra attention.',
  },
  nl: {
    error: 'De hele alinea is dikgedrukt.',
    href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/tekst-benadrukken/',
    solution:
      'Gebruik de optie om tekst dikgedrukt te maken alleen voor de woorden of zinnen die extra aandacht nodig hebben.',
  },
};
