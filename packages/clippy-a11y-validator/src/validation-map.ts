import type { ValidationMapResult, ValidatorSettings } from './types';
import { getElementRange } from './helpers';
import { runValidation } from './validators';

/**
 * Runs detection and returns a `Range`-keyed map, each entry carrying the
 * deferred correction its validator produced — the shape a live editor consumes.
 *
 * This is the browser/editor adapter over the framework-agnostic
 * {@link runValidation}: the only change it makes to a result is trading its
 * `element` for a DOM `Range`. Elements whose `Range` can't be created are skipped.
 */
export const buildValidationMap = (dom: HTMLElement, settings: ValidatorSettings): Map<Range, ValidationMapResult> => {
  const map = new Map<Range, ValidationMapResult>();

  for (const { element, ...result } of runValidation(dom, settings)) {
    const range = getElementRange(element);
    if (range) map.set(range, { ...result, range });
  }

  return map;
};
