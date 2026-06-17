import type { EditorSettings } from '@/types/settings.ts';
import type { ContentValidator, DocumentValidator, ValidationResult } from '@/types/validation.ts';
import { blockValidatorMap } from '@/validators/block';
import { documentValidatorObject } from '@/validators/document';
import { inlineValidatorMap } from '@/validators/inline';
import { debounce } from '../utils/debounce.ts';

const VALIDATION_TIMEOUT = 500;

/**
 * Normalise a rule identifier to the canonical SCREAMING_SNAKE_CASE format
 * used by the validator maps (e.g. `'NODE_SHOULD_NOT_BE_EMPTY'`).
 *
 * Accepts both kebab-case (`'node-should-not-be-empty'`) as used in HTML
 * `enable-rules` / `disable-rules` attributes, and SCREAMING_SNAKE_CASE
 * (`'NODE_SHOULD_NOT_BE_EMPTY'`) as used in TypeScript constants — both are
 * normalised to uppercase before comparison.
 */
const toUpperKey = (key: string): string => key.toUpperCase().replace(/-/g, '_');

/**
 * Filters a validator map to only the entries active under the given settings.
 *
 * - `disableRules: ['*']` — disables all validators in this map.
 * - `enableRules: ['*']` — enables all (minus any explicitly disabled).
 * - Otherwise only rules explicitly listed in `enableRules` are active.
 *
 * Rule identifiers are accepted in both kebab-case (`'node-should-not-be-empty'`)
 * and SCREAMING_SNAKE_CASE (`'NODE_SHOULD_NOT_BE_EMPTY'`) formats.
 */
const getActiveValidators = <V>(
  validators: Record<string, V>,
  { disableRules = [], enableRules }: EditorSettings,
): [string, V][] => {
  const normalisedDisable = disableRules.map(toUpperKey);
  if (normalisedDisable.includes('*')) return [];

  const entries = Object.entries(validators) as [string, V][];
  const disabled = new Set(normalisedDisable);

  const normalisedEnable = enableRules.map(toUpperKey);
  if (normalisedEnable.includes('*')) {
    return entries.filter(([key]) => !disabled.has(key));
  }

  const enabled = new Set(normalisedEnable);
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
  const activeBlockValidators = getActiveValidators<ContentValidator>(blockValidatorMap, settings);
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

  // Single depth-first DOM walk for block and inline validators
  const walk = (element: Element): void => {
    for (const [key, validator] of activeBlockValidators) {
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
    console.error('Block/inline validator error:', err);
  }

  callback(resultMap);
};

export const debouncedValidate = debounce(runValidation, VALIDATION_TIMEOUT);
