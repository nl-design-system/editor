import type { ContentValidator } from '@/types';
import { linkValidations, validationSeverity } from '@/constants';
import { correctGenericLinkText } from './corrector';
import { hasGenericLinkText } from './rules';

const linkShouldNotBeTooGeneric: ContentValidator = (_dom, node) => {
  if (!hasGenericLinkText(node)) return null;
  return {
    correct: correctGenericLinkText(node),
    element: node,
    scope: 'inline',
    severity: validationSeverity.INFO,
  };
};

// ── Validator map ─────────────────────────────────────────────────────────────

/** Build the link validators for one run. No rule here words its own `solution` yet. */
export const linkContentValidators = (): Record<string, ContentValidator> => ({
  [linkValidations.LINK_SHOULD_NOT_BE_TOO_GENERIC]: linkShouldNotBeTooGeneric,
});
