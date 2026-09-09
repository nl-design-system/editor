import type { Validation } from '../../types/validation.ts';
import { emphasisValidationRules } from './constants.ts';
import { emphasisShouldNotBeEmpty } from './should-not-be-empty/index.ts';
import { emphasisShouldNotBeUnderlined } from './should-not-be-underlined/index.ts';

export type EmphasisValidationRule = keyof typeof emphasisValidationRules;

export const emphasisValidations = {
  [emphasisValidationRules.EMPHASIS_SHOULD_NOT_BE_EMPTY]: emphasisShouldNotBeEmpty,
  [emphasisValidationRules.EMPHASIS_SHOULD_NOT_BE_UNDERLINED]: emphasisShouldNotBeUnderlined,
} satisfies Record<EmphasisValidationRule, Validation>;
