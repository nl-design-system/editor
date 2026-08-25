import type { ValidationMapResult, ValidatorSettings } from './types';
import { buildCorrection } from './correctors';
import { getElementRange } from './helpers';
import { runValidation } from './validators';

/**
 * Runs detection and returns a `Range`-keyed map, each entry carrying its
 * deferred correction — the shape a live editor consumes.
 *
 * This is the browser/editor adapter over the framework-agnostic
 * {@link runValidation}: it materialises a DOM `Range` per result and attaches
 * `buildCorrection`. Elements whose `Range` can't be created are skipped.
 */
export const buildValidationMap = (dom: HTMLElement, settings: ValidatorSettings): Map<Range, ValidationMapResult> => {
  const map = new Map<Range, ValidationMapResult>();

  for (const result of runValidation(dom, settings)) {
    const range = getElementRange(result.element);
    if (!range) continue;
    map.set(range, {
      correct: buildCorrection(result),
      range,
      scope: result.scope,
      severity: result.severity,
      solutionPayload: result.solutionPayload,
      validatorKey: result.validatorKey,
    });
  }

  return map;
};
