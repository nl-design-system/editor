import type { ValidationMessagesByLocale } from '../../../types/messages.ts';

export const messages: ValidationMessagesByLocale = {
  en: {
    error: 'This formatting element is empty.',
    solution: 'Remove the empty formatting element.',
    solutions: {
      bold: 'Remove the empty bold text.',
      code: 'Remove the empty code.',
      highlight: 'Remove the empty highlight.',
      italic: 'Remove the empty italic text.',
      strike: 'Remove the empty struck-through text.',
      underline: 'Remove the empty underlined text.',
    },
  },
  nl: {
    error: 'Dit opmaakelement is leeg.',
    solution: 'Verwijder het lege opmaakelement.',
    solutions: {
      bold: 'Verwijder de lege vetgedrukte tekst.',
      code: 'Verwijder de lege code.',
      highlight: 'Verwijder de lege markering.',
      italic: 'Verwijder de lege cursieve tekst.',
      strike: 'Verwijder de lege doorgehaalde tekst.',
      underline: 'Verwijder de lege onderstreepte tekst.',
    },
  },
};
