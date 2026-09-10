import type { ValidationMessagesByLocale } from '../../../types/messages.ts';

export const messages: ValidationMessagesByLocale = {
  en: {
    error: 'This description belongs to an empty term.',
    solution: 'Fill in the term, so it is clear what the description belongs to.',
  },
  nl: {
    error: 'Deze definitiebeschrijving hoort bij een lege definitieterm.',
    solution: 'Vul de definitieterm in, zodat duidelijk is waar de beschrijving bij hoort.',
  },
};
