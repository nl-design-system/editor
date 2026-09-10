import type { ValidationMessagesByLocale } from '../../../types/messages.ts';

export const messages: ValidationMessagesByLocale = {
  en: {
    error: 'This description list has no term.',
    solution: 'Fill in the term, so it is clear what is being described.',
  },
  nl: {
    error: 'Deze definitielijst heeft geen definitieterm.',
    solution: 'Vul de definitieterm in, zodat duidelijk is wat er beschreven wordt.',
  },
};
