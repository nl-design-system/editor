import type { ContentValidator } from '@/types';
import { imageValidations, validationSeverity } from '@/constants';
import { correctImageMissingAltText } from './corrector';
import { isMissingAltText } from './rules';

const imageMustHaveAltText: ContentValidator = (_dom, node) => {
  if (!isMissingAltText(node)) return null;
  return {
    correct: correctImageMissingAltText(node as HTMLImageElement),
    element: node,
    scope: 'block',
    severity: validationSeverity.INFO,
  };
};

// ── Validator map ─────────────────────────────────────────────────────────────

export const imageContentValidators: Record<string, ContentValidator> = {
  [imageValidations.IMAGE_MUST_HAVE_ALT_TEXT]: imageMustHaveAltText,
};
