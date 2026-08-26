import type { ContentValidator } from '@/types';
import { imageValidations, validationSeverity } from '@/constants';
import { correctImageMissingAltText } from './corrector';
import { isMissingAltText } from './rules';

const imageMustHaveAltText: ContentValidator = (_dom, node, { t }) => {
  if (!isMissingAltText(node)) return null;
  return {
    correct: correctImageMissingAltText(node as HTMLImageElement),
    element: node,
    scope: 'block',
    severity: validationSeverity.INFO,
    solution: t(`${imageValidations.IMAGE_MUST_HAVE_ALT_TEXT}.solution`),
  };
};

// ── Validator map ─────────────────────────────────────────────────────────────

export const imageContentValidators: Record<string, ContentValidator> = {
  [imageValidations.IMAGE_MUST_HAVE_ALT_TEXT]: imageMustHaveAltText,
};
