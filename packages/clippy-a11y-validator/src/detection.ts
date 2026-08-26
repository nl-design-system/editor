import type { ContentValidator, TreeValidator, ValidationContext, ValidationResult, ValidatorSettings } from './types';
import { contentValidators, treeValidators } from './components';
import { walkElements } from './helpers';
import { validationContext } from './i18n';

/**
 * Normalise a rule identifier to the canonical SCREAMING_SNAKE_CASE format
 * used by the validator maps (e.g. `'NODE_SHOULD_NOT_BE_EMPTY'`).
 *
 * Accepts both kebab-case (`'node-should-not-be-empty'`) as used in HTML
 * `enable-rules` / `disable-rules` attributes, and SCREAMING_SNAKE_CASE
 * (`'NODE_SHOULD_NOT_BE_EMPTY'`) as used in TypeScript constants — both are
 * normalised to uppercase before comparison.
 */
const toScreamingSnakeCase = (key: string): string => key.toUpperCase().replaceAll('-', '_');

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
  const normalisedDisable = disableRules.map(toScreamingSnakeCase);
  if (normalisedDisable.includes('*')) return [];

  const entries = Object.entries(validators) as [string, V][];
  const disabled = new Set(normalisedDisable);

  const normalisedEnable = enableRules.map(toScreamingSnakeCase);
  if (normalisedEnable.includes('*')) {
    return entries.filter(([key]) => !disabled.has(key));
  }

  const enabled = new Set(normalisedEnable);
  return entries.filter(([key]) => enabled.has(key) && !disabled.has(key));
};

/**
 * Runs a set of validators over one target, tags each result with the rule that
 * produced it, and isolates failures so a single faulty validator cannot abort
 * the rest.
 *
 * Generic over the validator's arguments, so tree validators (which take the
 * content root and the run's context) and content validators (which take the root,
 * one element and the context) share this one implementation. A validator may
 * return a single result, several, or `null`.
 */
export const runValidators = <Args extends unknown[]>(
  validators: [string, (...args: Args) => ValidationResult | ValidationResult[] | null][],
  ...args: Args
): ValidationResult[] => {
  const results: ValidationResult[] = [];
  for (const [key, validator] of validators) {
    try {
      const produced = validator(...args);
      for (const result of produced === null ? [] : [produced].flat()) {
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
 * Recurse the DOM depth-first, running every content validator on each element.
 * Returns results in document order.
 */
export const collectContentValidations = (
  dom: HTMLElement,
  validators: [string, ContentValidator][],
  context: ValidationContext = validationContext(),
): ValidationResult[] =>
  [...walkElements(dom)].flatMap((element) =>
    runValidators<[HTMLElement, Element, ValidationContext]>(validators, dom, element, context),
  );

/**
 * Run every whole-tree validator. Each does its own internal DOM queries,
 * so no walk is needed. Failures are isolated per validator.
 */
export const collectTreeValidations = (
  dom: HTMLElement,
  context: ValidationContext,
  validators: [string, TreeValidator][],
): ValidationResult[] => runValidators<[HTMLElement, ValidationContext]>(validators, dom, context);

/**
 * Runs every active validator against `dom` and returns the detection results in
 * document order, each with its `solution` text translated into `settings.locale`.
 * This is the framework-agnostic core: it applies no correction, dispatches no
 * events, and produces no `Range` — consumers derive whatever location
 * representation they need from `result.element`.
 */
export const runValidation = (dom: HTMLElement, settings: ValidatorSettings): ValidationResult[] => {
  // Bind the translator to this run's locale once, so no validator has to thread it.
  const context = validationContext(settings);

  // Pre-compute active validators once — avoids re-filtering on every node during the walk.
  const activeTreeValidators = getActiveValidators<TreeValidator>(treeValidators, settings);
  const activeContentValidators = getActiveValidators<ContentValidator>(contentValidators, settings);

  return [
    ...collectTreeValidations(dom, context, activeTreeValidators),
    ...collectContentValidations(dom, activeContentValidators, context),
  ];
};
