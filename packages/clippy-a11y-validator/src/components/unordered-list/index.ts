import type { Validation } from '../../types/validation.ts';
import { unorderedListValidationRules } from './constants.ts';
import { unorderedListItemShouldNotBeEmpty } from './item-should-not-be-empty/index.ts';

export { unorderedListRegex } from './regex.ts';
export { unorderedListValidationRules };

export type UnorderedListValidationRule = keyof typeof unorderedListValidationRules;

export const unorderedListValidations = {
  [unorderedListValidationRules.UNORDERED_LIST_ITEM_SHOULD_NOT_BE_EMPTY]: unorderedListItemShouldNotBeEmpty,
} satisfies Record<UnorderedListValidationRule, Validation>;
