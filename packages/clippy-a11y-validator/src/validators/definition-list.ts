import type { ContentValidator } from '@/types';
import { definitionListValidations, validationSeverity } from '@/constants';
import { correctDefinitionListMissingTerm, correctDefinitionTermMissingDescription } from '@/correctors';
import { isEmptyOrWhitespace } from '@/helpers';

const definitionDescriptionMustFollowTerm: ContentValidator = (_dom, node) => {
  if (node.tagName !== 'DT') return null;
  if (!isEmptyOrWhitespace(node.textContent ?? '')) return null;
  const dd = node.nextElementSibling;
  if (dd?.tagName !== 'DD') return null;
  if (isEmptyOrWhitespace(dd.textContent ?? '')) return null;
  return {
    correct: correctDefinitionTermMissingDescription(node),
    element: node,
    scope: 'block',
    severity: validationSeverity.ERROR,
  };
};

const descriptionListMustContainTerm: ContentValidator = (_dom, node) => {
  if (node.tagName !== 'DL') return null;
  const terms = Array.from(node.querySelectorAll('dt')).filter((dt) => dt.closest('dl') === node);
  if (terms.length === 0) return null;
  if (terms.some((dt) => !isEmptyOrWhitespace(dt.textContent ?? ''))) return null;
  return {
    correct: correctDefinitionListMissingTerm(node),
    element: node,
    scope: 'block',
    severity: validationSeverity.ERROR,
  };
};

// ── Validator map ─────────────────────────────────────────────────────────────

export const definitionListContentValidators: Record<string, ContentValidator> = {
  [definitionListValidations.DEFINITION_DESCRIPTION_MUST_FOLLOW_TERM]: definitionDescriptionMustFollowTerm,
  [definitionListValidations.DESCRIPTION_LIST_MUST_CONTAIN_TERM]: descriptionListMustContainTerm,
};
