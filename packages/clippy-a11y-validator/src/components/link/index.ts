import type { Validation } from '../../types/validation.ts';
import { linkValidationRules } from './constants.ts';
import { linkShouldNotBeEmpty } from './should-not-be-empty/index.ts';
import { linkShouldNotBeTooGeneric } from './should-not-be-too-generic/index.ts';

export type LinkValidationRule = keyof typeof linkValidationRules;

export const linkValidations = {
  [linkValidationRules.LINK_SHOULD_NOT_BE_EMPTY]: linkShouldNotBeEmpty,
  [linkValidationRules.LINK_SHOULD_NOT_BE_TOO_GENERIC]: linkShouldNotBeTooGeneric,
} satisfies Record<LinkValidationRule, Validation>;
