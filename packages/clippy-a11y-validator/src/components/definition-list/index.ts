import type { ContentValidator } from '@/types';
import { definitionListValidations, validationSeverity } from '@/constants';
import { correctDefinitionListMissingTerm, correctDefinitionTermMissingDescription } from './corrector';
import { hasOnlyEmptyTerms, isEmptyTermWithDescription } from './rules';

const definitionDescriptionMustFollowTerm: ContentValidator = (_dom, node) => {
  if (!isEmptyTermWithDescription(node)) return null;
  return {
    correct: correctDefinitionTermMissingDescription(node),
    element: node,
    scope: 'block',
    severity: validationSeverity.ERROR,
  };
};

const descriptionListMustContainTerm: ContentValidator = (_dom, node) => {
  if (!hasOnlyEmptyTerms(node)) return null;
  return {
    correct: correctDefinitionListMissingTerm(node),
    element: node,
    scope: 'block',
    severity: validationSeverity.ERROR,
  };
};

// ── Validator map ─────────────────────────────────────────────────────────────

/** Build the definition-list validators for one run. No rule here words its own `solution` yet. */
export const definitionListContentValidators = (): Record<string, ContentValidator> => ({
  [definitionListValidations.DEFINITION_DESCRIPTION_MUST_FOLLOW_TERM]: definitionDescriptionMustFollowTerm,
  [definitionListValidations.DESCRIPTION_LIST_MUST_CONTAIN_TERM]: descriptionListMustContainTerm,
});
