import type { Context } from '@nl-design-system-community/editor';
import { coreValidations, type CoreValidationRule } from '@nl-design-system-community/clippy-a11y-validator';

/**
 * Each example runs only the rule it demonstrates, named in `data-validations`, so the rest of the example
 * markup stays unflagged.
 */
for (const editor of document.querySelectorAll<Context>('clippy-context[data-validations]')) {
  editor.validations = (editor.dataset['validations'] ?? '')
    .split(' ')
    .map((rule) => coreValidations[rule as CoreValidationRule]);
}
