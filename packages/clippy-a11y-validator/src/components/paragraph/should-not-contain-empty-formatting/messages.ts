import type { ValidationMessagesByLocale } from '../../../types/messages.ts';

export const messages: ValidationMessagesByLocale = {
  nl: {
    explanation: '<p class="nl-paragraph">Het <code class="nl-code">&lt;{tag}&gt;</code>-element is leeg.</p>',
    solution:
      '<p class="nl-paragraph">Verwijder het lege <code class="nl-code">&lt;{tag}&gt;</code>-element of voeg tekst toe.</p>',
    title: 'Leeg opmaak-element gevonden',
  },
};
