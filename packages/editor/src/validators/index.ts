import { runValidation as detect } from '@nl-design-system-community/clippy-a11y-validator';
import { buildCorrection } from '@nl-design-system-community/clippy-a11y-validator/correctors';
import type { EditorSettings } from '@/types/settings';
import type { ValidationResult } from '@/types/validation';
import { debounce } from '@/utils/debounce';
import { getElementRange } from '@/validators/helpers';

const VALIDATION_TIMEOUT = 500;

// Detection and corrections both live in the validator package; here we adapt the
// results into the editor's `Range`-keyed shape. The alt-text correction surfaces
// its request through the global `clippy:open-image-dialog` event (see the editor's
// `toolbar-image`, which listens for `GlobalEvents.OPEN_IMAGE_DIALOG`).
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
      correct: buildCorrection(result),
      range,
      scope: result.scope,
      severity: result.severity,
      solutionPayload: result.solutionPayload,
      validatorKey: result.validatorKey,
    });
  }

  callback(resultMap);
};

export const debouncedValidate = debounce(runValidation, VALIDATION_TIMEOUT);
