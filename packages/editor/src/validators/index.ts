import { type Editor, Extension } from '@tiptap/core';
import type { EditorSettings } from '@/types/settings.ts';
import type { ValidationResult } from '@/types/validation.ts';
import { CustomEvents } from '@/events';
import contentValidator from '@/validators/content';
import documentValidators from '@/validators/document';
import { debounce } from '../utils/debounce.ts';

const VALIDATION_TIMEOUT = 500;

const runValidation = (
  editor: Editor,
  settings: EditorSettings,
  callback: (resultMap: Map<string, ValidationResult>) => void,
) => {
  let validationResultMap = new Map<string, ValidationResult>();

  for (const [key, validator] of documentValidators.entries()) {
    try {
      const result = validator(editor, settings);
      if (result) {
        validationResultMap.set(key, result);
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

const debouncedValidate = debounce(runValidation, VALIDATION_TIMEOUT);

export default Extension.create({
  name: 'validation',

  addKeyboardShortcuts() {
    return {
      'Mod-Alt-t': () => {
        const event = new CustomEvent(CustomEvents.OPEN_VALIDATIONS_DIALOG, {
          bubbles: true,
          composed: true,
        });
        globalThis.dispatchEvent(event);
        return true;
      },
    };
  },

  onCreate({ editor }) {
    const { settings, updateValidationsContext } = this.options;
    runValidation(editor, settings, updateValidationsContext);
  },

  onUpdate({ editor }) {
    const { settings, updateValidationsContext } = this.options;
    debouncedValidate(editor, settings, updateValidationsContext);
  },
});
