import { type Editor } from '@tiptap/core';
import type { EditorSettings } from '@/types/settings.ts';
import type { ValidationResult } from '@/validators/classes/ValidationResult.ts';
import contentValidator from '@/validators/content';
import documentValidators from '@/validators/document';
import { debounce } from '../utils/debounce.ts';

const VALIDATION_TIMEOUT = 500;

export const runValidation = (
  editor: Editor,
  settings: EditorSettings,
  callback: (resultMap: Map<string, ValidationResult>) => void,
) => {
  let validationResultMap = new Map<string, ValidationResult>();

  for (const [key, validator] of documentValidators.entries()) {
    try {
      const result = validator(editor, settings);
      if (result.length > 0) {
        for (const res of result) {
          validationResultMap.set(`${key}_${res.pos}`, res);
        }
      }
    } catch (err) {
      console.error('document validator error', err);
    }
  }

  try {
    const contentValidationResultMap = contentValidator(editor);
    if (contentValidationResultMap.size > 0) {
      validationResultMap = new Map<string, ValidationResult>([...validationResultMap, ...contentValidationResultMap]);
    }
  } catch (err) {
    console.error('content validator error', err);
  }

  callback(validationResultMap);
};

export const debouncedValidate = debounce(runValidation, VALIDATION_TIMEOUT);
