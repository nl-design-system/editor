import type { ContentValidator, ValidationContext } from '@/types';
import { imageValidations, validationSeverity } from '@/constants';
import { correctImageMissingAltText } from './corrector';
import { isMissingAltText } from './rules';

const imageMustHaveAltText =
  ({ t }: ValidationContext): ContentValidator =>
  (_dom, node) => {
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

/** Build the image validators for one run, closing over the context's translator. */
export const imageContentValidators = (context: ValidationContext): Record<string, ContentValidator> => ({
  [imageValidations.IMAGE_MUST_HAVE_ALT_TEXT]: imageMustHaveAltText(context),
});
