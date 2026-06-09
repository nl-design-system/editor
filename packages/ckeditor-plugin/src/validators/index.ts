import type { Element } from 'ckeditor5';
import type { ValidationResult } from '../types/';
import { contentValidators } from './content.ts';
import { documentValidators } from './document.ts';
import { walkElements } from './helpers.ts';

export const runDocumentValidators = (root: Element): ValidationResult[] =>
  documentValidators.flatMap((validator) => validator(root));

export const runContentValidators = (root: Element): ValidationResult[] => {
  const results: ValidationResult[] = [];
  for (const element of walkElements(root)) {
    for (const validator of contentValidators) {
      const result = validator(element);
      if (result) {
        results.push(result);
      }
    }
  }
  return results;
};

export const runValidation = (root: Element): ValidationResult[] => [
  ...runDocumentValidators(root),
  ...runContentValidators(root),
];
