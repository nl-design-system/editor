import type { ValidationMessagesByLocale } from '../../../types/messages.ts';

export const messages: ValidationMessagesByLocale = {
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
