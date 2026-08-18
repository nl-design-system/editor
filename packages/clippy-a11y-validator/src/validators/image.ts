import type { ContentValidator } from '@/types';
import { imageValidations, validationSeverity } from '@/constants';
import { correctImageMissingAltText } from '@/correctors';
import { isEmptyOrWhitespace } from '@/helpers';

const imageMustHaveAltText: ContentValidator = (_dom, node) => {
  if (node.tagName !== 'IMG') return null;
  const alt = (node as HTMLImageElement).alt;
  if (alt && !isEmptyOrWhitespace(alt)) return null;
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
