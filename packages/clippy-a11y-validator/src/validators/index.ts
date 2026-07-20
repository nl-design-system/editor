import type { ContentValidator, DocumentValidator, ValidationResult, ValidatorSettings } from '../types';
import { blockValidatorMap } from './block';
import { documentValidatorObject } from './document';
import { inlineValidatorMap } from './inline';

/**
 * Normalise a rule identifier to the canonical SCREAMING_SNAKE_CASE format
 * used by the validator maps (e.g. `'NODE_SHOULD_NOT_BE_EMPTY'`).
 *
 * Accepts both kebab-case (`'node-should-not-be-empty'`) as used in HTML
 * `enable-rules` / `disable-rules` attributes, and SCREAMING_SNAKE_CASE
 * (`'NODE_SHOULD_NOT_BE_EMPTY'`) as used in TypeScript constants — both are
 * normalised to uppercase before comparison.
 */
const toUpperKey = (key: string): string => key.toUpperCase().replaceAll('-', '_');

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
export const getActiveValidators = <V>(
  validators: Record<string, V>,
  { disableRules = [], enableRules }: ValidatorSettings,
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

/**
 * Runs every active validator against `dom` and returns the raw detection
 * results in document order. This is the framework-agnostic core: it performs
 * no correction, dispatches no events, and produces no `Range` — consumers
 * derive whatever location representation they need from `result.element`.
 */
export const runValidation = (dom: HTMLElement, settings: ValidatorSettings): ValidationResult[] => {
  const results: ValidationResult[] = [];

  // Pre-compute active validators once — avoids re-filtering on every node during the walk
  const activeDocumentValidators = getActiveValidators<DocumentValidator>(documentValidatorObject, settings);
  const activeBlockValidators = getActiveValidators<ContentValidator>(blockValidatorMap, settings);
  const activeInlineValidators = getActiveValidators<ContentValidator>(inlineValidatorMap, settings);

  // Run document-level validators (each does its own internal DOM queries)
  for (const [key, validator] of activeDocumentValidators) {
    try {
      for (const result of validator(dom, settings)) {
        result.validatorKey = key;
        results.push(result);
      }
    } catch (err) {
      console.error('Document validator error:', err);
    }
  }

  // Single depth-first DOM walk for block and inline validators
  const walk = (element: Element): void => {
    for (const [key, validator] of activeBlockValidators) {
      const result = validator(dom, element);
      if (result) {
        result.validatorKey = key;
        results.push(result);
      }
    }
    for (const [key, validator] of activeInlineValidators) {
      const result = validator(dom, element);
      if (result) {
        result.validatorKey = key;
        results.push(result);
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

  return results;
};
