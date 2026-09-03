import type { ValidationMessagesByLocale } from '../../../types/messages.ts';

// Copied from @nl-design-system-unstable/documentation componenten/paragraph/_issues/strong.
export const messages: ValidationMessagesByLocale = {
  nl: {
    error: 'De hele alinea is dikgedrukt.',
    solution:
      'Gebruik de optie om tekst dikgedrukt te maken alleen voor de woorden of zinnen die extra aandacht nodig hebben.',
    solutions: {
      heading: 'Gebruik een kop in plaats van een dikgedrukte alinea.',
    },
  },
};
