import type { ValidationMessagesByLocale } from '../../../types/messages.ts';

export const messages: ValidationMessagesByLocale = {
  en: {
    error: 'This table cell is empty.',
    solution: 'Fill in the cell, so it is clear that no data is missing.',
  },
  nl: {
    error: 'Deze tabelcel is leeg.',
    solution: 'Vul de cel in, zodat duidelijk is dat er geen gegevens ontbreken.',
  },
};
