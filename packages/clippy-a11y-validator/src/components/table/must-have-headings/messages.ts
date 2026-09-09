import type { ValidationMessagesByLocale } from '../../../types/messages.ts';

export const messages: ValidationMessagesByLocale = {
  nl: {
    error: 'Deze tabel heeft geen koprij en geen kopkolom.',
    solution: 'Maak van de eerste rij of de eerste kolom een kop, zodat hulpsoftware de cellen kan benoemen.',
  },
};
