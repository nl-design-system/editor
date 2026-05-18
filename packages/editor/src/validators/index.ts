import { type Editor } from '@tiptap/core';
import type { EditorSettings } from '@/types/settings.ts';
import type { ValidationResult } from '@/types/validation.ts';
import contentValidator, { contentValidatorMap } from '@/validators/content';
import { documentValidatorObject } from '@/validators/document';
import { debounce } from '../utils/debounce.ts';
import { applyValidationHighlights } from '../utils/highlights.ts';
import { getEntries, isKeyOf } from './helpers.ts';

const VALIDATION_TIMEOUT = 500;

export const runValidation = (
  editor: Editor,
  settings: EditorSettings,
  callback: (resultMap: Map<string, ValidationResult>) => void,
) => {
  const documentValidationSettings = {
    disableRules: settings.disableRules?.filter((x) => x === '*' || isKeyOf(documentValidatorObject)(x)),
    enableRules: settings.enableRules.filter((x) => x === '*' || isKeyOf(documentValidatorObject)(x)),
  };
  const contentValidationSettings = {
    disableRules: settings.disableRules?.filter((x) => x === '*' || isKeyOf(contentValidatorMap)(x)),
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
  // Pass the live editor DOM element so validators can build DOM Ranges and
  // `correct` callbacks can resolve ProseMirror positions via posAtDOM.
  // Guard against cases where the editor view is not yet mounted (e.g. SSR or
  // editors that are constructed but not yet attached to the DOM).
  let content: HTMLElement;
  try {
    content = editor.view.dom;
  } catch (err) {
    console.error('document validator error', err);
    return;
  }

  for (const [key, validator] of documentValidators) {
    try {
      const result = validator?.(content, settings);
      if (result?.length && result.length > 0) {
        for (const [index, res] of result.entries()) {
          validationResultMap.set(`${key}_${index}`, res);
        }
      }
    } catch (err) {
      console.error('document validator error', err);
    }
  }

  try {
    const contentValidationResultMap = contentValidator(content, contentValidators);
    if (contentValidationResultMap.size > 0) {
      validationResultMap = new Map<string, ValidationResult>([...validationResultMap, ...contentValidationResultMap]);
    }
  } catch (err) {
    console.error('content validator error', err);
  }

  callback(validationResultMap);
  applyValidationHighlights(validationResultMap);
};

export const debouncedValidate = debounce(runValidation, VALIDATION_TIMEOUT);
