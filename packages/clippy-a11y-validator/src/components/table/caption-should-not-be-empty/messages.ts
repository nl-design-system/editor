import type { ValidationMessagesByLocale } from '../../../types/messages.ts';

export const messages: ValidationMessagesByLocale = {
  en: {
    error: 'This table has an empty caption.',
    solution: 'Describe in the caption what the table is about.',
  },
  nl: {
    error: 'Deze tabel heeft een lege omschrijving.',
    solution: 'Beschrijf in de omschrijving waar de tabel over gaat.',
  },
};
