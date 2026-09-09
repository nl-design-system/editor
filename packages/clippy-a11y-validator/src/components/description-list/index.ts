import type { Validation } from '../../types/validation.ts';
import { descriptionListValidationRules } from './constants.ts';
import { descriptionShouldNotBeEmpty } from './description-should-not-be-empty/index.ts';
import { descriptionListMustContainTerm } from './must-contain-term/index.ts';
import { descriptionTermMustHaveDescription } from './term-must-have-description/index.ts';
import { descriptionTermShouldNotBeEmpty } from './term-should-not-be-empty/index.ts';

export type DescriptionListValidationRule = keyof typeof descriptionListValidationRules;

export const descriptionListValidations = {
  [descriptionListValidationRules.DESCRIPTION_LIST_MUST_CONTAIN_TERM]: descriptionListMustContainTerm,
  [descriptionListValidationRules.DESCRIPTION_SHOULD_NOT_BE_EMPTY]: descriptionShouldNotBeEmpty,
  [descriptionListValidationRules.DESCRIPTION_TERM_MUST_HAVE_DESCRIPTION]: descriptionTermMustHaveDescription,
  [descriptionListValidationRules.DESCRIPTION_TERM_SHOULD_NOT_BE_EMPTY]: descriptionTermShouldNotBeEmpty,
} satisfies Record<DescriptionListValidationRule, Validation>;
