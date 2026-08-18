import { msg } from '@lit/localize';
import { runValidation as detect, type ImageAltTextRequest } from '@nl-design-system-community/clippy-a11y-validator';
import { buildCorrection, type CorrectionHost } from '@nl-design-system-community/clippy-a11y-validator/correctors';
import type { EditorSettings } from '@/types/settings';
import type { ValidationResult } from '@/types/validation';
import { CustomEvents } from '@/events';
import { debounce } from '@/utils/debounce';
import { getElementRange } from '@/validators/helpers';

const VALIDATION_TIMEOUT = 500;

// Hands an image off to the editor's alt-text dialog — the editor's side of the
// validator's `correctImageMissingAltText`.
const requestAltText = (request: ImageAltTextRequest): void => {
  globalThis.dispatchEvent(new CustomEvent(CustomEvents.OPEN_IMAGE_DIALOG, { detail: request }));
};

// Detection and corrections both live in the validator package; here we adapt the
// results into the editor's `Range`-keyed shape and supply the editor-specific
// hooks the corrections need (the localized label, the alt-text dialog).
export const runValidation = (
  dom: HTMLElement,
  settings: EditorSettings,
  callback: (resultMap: Map<Range, ValidationResult>) => void,
): void => {
  const resultMap = new Map<Range, ValidationResult>();

  // Built once per run so `msg()` reflects the active locale without re-resolving per result.
  const correctionHost: CorrectionHost = {
    definitionTermLabel: msg('definition term'),
    onRequestAltText: requestAltText,
  };

  for (const result of detect(dom, settings)) {
    const range = getElementRange(result.element);
    if (!range) continue;
    resultMap.set(range, {
      correct: buildCorrection(result, correctionHost),
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
