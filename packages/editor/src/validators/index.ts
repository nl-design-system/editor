import { type Editor } from '@tiptap/core';
import type { EditorSettings } from '@/types/settings.ts';
import type { ValidationResult } from '@/types/validation.ts';
import contentValidator, { contentValidatorMap } from '@/validators/content';
import { documentValidatorObject } from '@/validators/document';
import { debounce } from '../utils/debounce.ts';
import { getEntries, isKeyOf } from './helpers.ts';

const VALIDATION_TIMEOUT = 500;

export const runValidation = (
  editor: Editor,
  settings: EditorSettings,
  callback: (resultMap: Map<string, ValidationResult>) => void,
) => {
  const documentValidationSettings = {
    disableRules: settings.disableRules.filter((x) => x === '*' || isKeyOf(documentValidatorObject)(x)),
    enableRules: settings.enableRules.filter((x) => x === '*' || isKeyOf(documentValidatorObject)(x)),
  };
  const contentValidationSettings = {
    disableRules: settings.disableRules.filter((x) => x === '*' || isKeyOf(contentValidatorMap)(x)),
    enableRules: settings.enableRules.filter((x) => x === '*' || isKeyOf(contentValidatorMap)(x)),
  };
  let validationResultMap = new Map<string, ValidationResult>();
  const documentValidators = Object.entries(
    getEntries(
      documentValidatorObject,
      documentValidationSettings.enableRules,
      documentValidationSettings.disableRules,
    ),
  );
  const contentValidators = getEntries(
    contentValidatorMap,
    contentValidationSettings.enableRules,
    contentValidationSettings.disableRules,
  );
  for (const [key, validator] of documentValidators) {
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
    const contentValidationResultMap = contentValidator(editor, contentValidators);
    if (contentValidationResultMap.size > 0) {
      validationResultMap = new Map<string, ValidationResult>([...validationResultMap, ...contentValidationResultMap]);
    }
  } catch (err) {
    console.error('content validator error', err);
  }

  callback(validationResultMap);
};

export const debouncedValidate = debounce(runValidation, VALIDATION_TIMEOUT);
