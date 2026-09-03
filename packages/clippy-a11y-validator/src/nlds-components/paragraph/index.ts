import type { Validation } from '../../types/validation.ts';
import { paragraphValidationRules } from './constants.ts';
import { paragraphShouldNotBeEmpty } from './should-not-be-empty/index.ts';
import { paragraphShouldNotBeEntirelyBold } from './should-not-be-entirely-bold/index.ts';

export type ParagraphValidationRule = keyof typeof paragraphValidationRules;

export const paragraphValidations = {
  [paragraphValidationRules.PARAGRAPH_SHOULD_NOT_BE_EMPTY]: paragraphShouldNotBeEmpty,
  [paragraphValidationRules.PARAGRAPH_SHOULD_NOT_BE_ENTIRELY_BOLD]: paragraphShouldNotBeEntirelyBold,
} satisfies Record<ParagraphValidationRule, Validation>;
