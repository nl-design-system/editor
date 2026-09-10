import type { ValidationMessagesByLocale } from '../../../types/messages.ts';

export const messages: ValidationMessagesByLocale = {
  en: {
    error: 'This image has no alternative text.',
    solution: 'Describe in the alternative text what the image shows.',
  },
  nl: {
    error: 'Deze afbeelding heeft geen alternatieve tekst.',
    solution: 'Beschrijf in de alternatieve tekst wat er op de afbeelding te zien is.',
  },
};
