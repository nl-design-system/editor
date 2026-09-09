import type { Validation } from '../../types/validation.ts';
import { imageValidationRules } from './constants.ts';
import { imageMustHaveAltText } from './must-have-alt-text/index.ts';

export type ImageValidationRule = keyof typeof imageValidationRules;

export const imageValidations = {
  [imageValidationRules.IMAGE_MUST_HAVE_ALT_TEXT]: imageMustHaveAltText,
} satisfies Record<ImageValidationRule, Validation>;
