import type { ValidationMessagesByLocale } from '../../../types/messages.ts';

export const messages: ValidationMessagesByLocale = {
  en: {
    error: 'This table has fewer than two rows.',
    solution: 'Add rows, or do not use a table if there is nothing to compare.',
  },
  nl: {
    error: 'Deze tabel heeft minder dan twee rijen.',
    solution: 'Voeg rijen toe, of gebruik geen tabel als er niets te vergelijken valt.',
  },
};
