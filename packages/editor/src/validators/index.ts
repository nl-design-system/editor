import { runValidation as detect } from '@nl-design-system-community/clippy-a11y-validator';
import type { EditorSettings } from '@/types/settings';
import type { ValidationResult } from '@/types/validation';
import { buildCorrector } from '@/correctors/registry';
import { debounce } from '@/utils/debounce';
import { getElementRange } from '@/validators/helpers';

const VALIDATION_TIMEOUT = 500;

/**
 * Runs the framework-agnostic detection rules and adapts the results into the
 * editor's `Range`-keyed shape, re-attaching the interactive `correct` action
 * for each issue.
 *
 * The pure detection logic lives in
 * `@nl-design-system-community/clippy-a11y-validator`; everything editor-specific
 * (DOM `Range`s, corrections that dispatch events / move the selection) is layered
 * on here.
 */
export const runValidation = (
  dom: HTMLElement,
  settings: EditorSettings,
  callback: (resultMap: Map<Range, ValidationResult>) => void,
): void => {
  const resultMap = new Map<Range, ValidationResult>();

  for (const result of detect(dom, settings)) {
    const range = getElementRange(result.element);
    if (!range) continue;
    resultMap.set(range, {
      correct: buildCorrector(result, range),
      range,
      scope: result.scope,
      severity: result.severity,
      tipPayload: result.tipPayload,
      validatorKey: result.validatorKey,
    });
  }

  callback(resultMap);
};

export const debouncedValidate = debounce(runValidation, VALIDATION_TIMEOUT);
