import type { CorrectValidationFunction } from '@/types';

// TODO: this placeholder is not localized
const DEFAULT_DEFINITION_TERM_LABEL = 'definition term';

// Fill the first empty <dt> with the placeholder label.
export const correctDefinitionListMissingTerm =
  (node: Element): CorrectValidationFunction =>
  () => {
    const emptyDt = Array.from(node.querySelectorAll('dt')).find((dt) => !dt.textContent?.trim());
    if (emptyDt) emptyDt.textContent = DEFAULT_DEFINITION_TERM_LABEL;
  };

// Fill an empty term with the placeholder label.
export const correctDefinitionTermMissingDescription =
  (node: Element): CorrectValidationFunction =>
  () => {
    node.textContent = DEFAULT_DEFINITION_TERM_LABEL;
  };
