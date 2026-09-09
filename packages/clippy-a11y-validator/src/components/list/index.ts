import type { Validation } from '../../types/validation.ts';
import { listValidationRules } from './constants.ts';
import { listItemShouldNotBeEmpty } from './item-should-not-be-empty/index.ts';

export type ListValidationRule = keyof typeof listValidationRules;

export const listValidations = {
  [listValidationRules.LIST_ITEM_SHOULD_NOT_BE_EMPTY]: listItemShouldNotBeEmpty,
} satisfies Record<ListValidationRule, Validation>;
