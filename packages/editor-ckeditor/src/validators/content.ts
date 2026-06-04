import type { ContentValidator } from '../types/';
import { contentValidations, validationSeverity } from '../constants/';

const imageMustHaveAltText: ContentValidator = (element) => {
  if (element.name !== 'imageInline' && element.name !== 'imageBlock') {
    return null;
  }

  const alt = element.getAttribute('alt') as string | undefined;
  if (!alt || alt.trim() === '') {
    return {
      boundingBox: null,
      element,
      ruleId: contentValidations.IMAGE_MUST_HAVE_ALT_TEXT,
      severity: validationSeverity.INFO,
    };
  }

  return null;
};

export const contentValidators: ContentValidator[] = [imageMustHaveAltText];
