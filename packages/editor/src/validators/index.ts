import { buildValidationMap, type Locale } from '@nl-design-system-community/clippy-a11y-validator';
import type { EditorSettings } from '@/types/settings';
import type { ValidationResult } from '@/types/validation';
import { getDocumentLang } from '@/localization';
import { debounce } from '@/utils/debounce';

const VALIDATION_TIMEOUT = 500;

// Detection, `Range`-mapping, corrections, and the translated `solution` text all
// live in the validator package (`buildValidationMap`). This thin wrapper hands the
// map to the editor's callback and provides the debounced variant. The alt-text
// correction surfaces its request through the global `clippy:open-image-dialog`
// event (see the editor's `toolbar-image`, which listens for
// `GlobalEvents.OPEN_IMAGE_DIALOG`).
//
// The validator is given the document language so its solutions match the UI, which
// `@lit/localize` resolves from the same source.
export const runValidation = (
  dom: HTMLElement,
  settings: EditorSettings,
  callback: (resultMap: Map<Range, ValidationResult>) => void,
): void => {
  callback(buildValidationMap(dom, { ...settings, locale: getDocumentLang() as Locale }));
};

export const debouncedValidate = debounce(runValidation, VALIDATION_TIMEOUT);
