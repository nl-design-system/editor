import type { Validation } from '../../types/validation.ts';
import { orderedListValidationRules } from './constants.ts';
import { orderedListItemShouldNotBeEmpty } from './item-should-not-be-empty/index.ts';

export { orderedListRegex } from './regex.ts';
export { orderedListValidationRules };

export type OrderedListValidationRule = keyof typeof orderedListValidationRules;

export const orderedListValidations = {
  [orderedListValidationRules.ORDERED_LIST_ITEM_SHOULD_NOT_BE_EMPTY]: orderedListItemShouldNotBeEmpty,
} satisfies Record<OrderedListValidationRule, Validation>;
