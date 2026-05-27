import type { EditorSettings } from '@/types/settings.ts';
import type { ContentValidator, DocumentValidator, ValidationResult } from '@/types/validation.ts';
import { documentValidatorObject } from '@/validators/document';
import { elementValidatorMap } from '@/validators/element';
import { inlineValidatorMap } from '@/validators/inline';
import { debounce } from '../utils/debounce.ts';

const VALIDATION_TIMEOUT = 500;

/**
 * Filters a validator map to only the entries active under the given settings.
 *
 * - `disableRules: ['*']` — disables all validators in this map.
 * - `enableRules: ['*']` — enables all (minus any explicitly disabled).
 * - Otherwise only rules explicitly listed in `enableRules` are active.
 */
const getActiveValidators = <V>(
  validators: Record<string, V>,
  { disableRules = [], enableRules }: EditorSettings,
): [string, V][] => {
  if (disableRules.includes('*')) return [];

  const entries = Object.entries(validators) as [string, V][];
  const disabled = new Set(disableRules);

  if (enableRules.includes('*')) {
    return entries.filter(([key]) => !disabled.has(key));
  }

  const enabled = new Set(enableRules);
  return entries.filter(([key]) => enabled.has(key) && !disabled.has(key));
};

export const runValidation = (
  dom: HTMLElement,
  settings: EditorSettings,
  callback: (resultMap: Map<Range, ValidationResult>) => void,
): void => {
  const resultMap = new Map<Range, ValidationResult>();

  // Pre-compute active validators once — avoids re-filtering on every node during the walk
  const activeDocumentValidators = getActiveValidators<DocumentValidator>(documentValidatorObject, settings);
  const activeElementValidators = getActiveValidators<ContentValidator>(elementValidatorMap, settings);
  const activeInlineValidators = getActiveValidators<ContentValidator>(inlineValidatorMap, settings);

  // Run document-level validators (each does its own internal DOM queries)
  for (const [key, validator] of activeDocumentValidators) {
    try {
      for (const result of validator(dom, settings)) {
        if (result.range) {
          result.validatorKey = key;
          resultMap.set(result.range, result);
        }
      }
    } catch (err) {
      console.error('Document validator error:', err);
    }
  }

  // Single depth-first DOM walk for element and inline validators
  const walk = (element: Element): void => {
    for (const [key, validator] of activeElementValidators) {
      const result = validator(dom, element);
      if (result?.range) {
        result.validatorKey = key;
        resultMap.set(result.range, result);
      }
    }
    for (const [key, validator] of activeInlineValidators) {
      const result = validator(dom, element);
      if (result?.range) {
        result.validatorKey = key;
        resultMap.set(result.range, result);
      }
    }
    for (const child of element.children) {
      walk(child);
    }
  };

  try {
    for (const child of dom.children) {
      walk(child);
    }
  } catch (err) {
    console.error('Element/inline validator error:', err);
  }

  callback(resultMap);
};

export const debouncedValidate = debounce(runValidation, VALIDATION_TIMEOUT);
