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

// Run each validator on one element, isolating failures so a single faulty
// validator can't abort the rest.
const runContentValidators = (
  dom: HTMLElement,
  element: Element,
  validators: [string, ContentValidator][],
): ValidationResult[] => {
  const results: ValidationResult[] = [];
  for (const [key, validator] of validators) {
    try {
      const result = validator(dom, element);
      if (result) {
        result.validatorKey = key;
        results.push(result);
      }
    } catch (err) {
      console.error(`Validator "${key}" error:`, err);
    }
  }
  return results;
};

/**
 * Recurse the DOM depth-first, running every content (block + inline) validator
 * on each element. Returns results in document order.
 */
export const collectContentValidations = (
  dom: HTMLElement,
  validators: [string, ContentValidator][],
): ValidationResult[] => {
  const results: ValidationResult[] = [];
  const walk = (element: Element): void => {
    results.push(...runContentValidators(dom, element, validators));
    for (const child of element.children) walk(child);
  };
  for (const child of dom.children) walk(child);
  return results;
};

/**
 * Run every document-level validator. Each does its own internal DOM queries,
 * so no walk is needed. Failures are isolated per validator.
 */
export const collectDocumentValidations = (
  dom: HTMLElement,
  settings: ValidatorSettings,
  validators: [string, DocumentValidator][],
): ValidationResult[] => {
  const results: ValidationResult[] = [];
  for (const [key, validator] of validators) {
    try {
      for (const result of validator(dom, settings)) {
        result.validatorKey = key;
        results.push(result);
      }
    } catch (err) {
      console.error(`Document validator "${key}" error:`, err);
    }
  }
  return results;
};

/**
 * Runs every active validator against `dom` and returns the raw detection
 * results in document order. This is the framework-agnostic core: it performs
 * no correction, dispatches no events, and produces no `Range` — consumers
 * derive whatever location representation they need from `result.element`.
 */
export const runValidation = (dom: HTMLElement, settings: ValidatorSettings): ValidationResult[] => {
  // Pre-compute active validators once — avoids re-filtering on every node during the walk.
  const activeDocumentValidators = getActiveValidators<DocumentValidator>(documentValidatorObject, settings);
  const activeContentValidators = [
    ...getActiveValidators<ContentValidator>(blockValidatorMap, settings),
    ...getActiveValidators<ContentValidator>(inlineValidatorMap, settings),
  ];

  return [
    ...collectDocumentValidations(dom, settings, activeDocumentValidators),
    ...collectContentValidations(dom, activeContentValidators),
  ];
};
