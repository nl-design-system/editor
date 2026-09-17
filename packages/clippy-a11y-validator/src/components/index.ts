import type { Validation } from '../types/validation.ts';
import { descriptionListValidationRules, descriptionListValidations } from './description-list/index.ts';
import { headingValidationRules, headingValidations } from './heading/index.ts';
import { imageValidationRules, imageValidations } from './image/index.ts';
import { linkValidationRules, linkValidations } from './link/index.ts';
import { orderedListValidationRules, orderedListValidations } from './ordered-list/index.ts';
import { paragraphValidationRules, paragraphValidations } from './paragraph/index.ts';
import { tableValidationRules, tableValidations } from './table/index.ts';
import { unorderedListValidationRules, unorderedListValidations } from './unordered-list/index.ts';

export const coreValidationRules = {
  ...descriptionListValidationRules,
  ...headingValidationRules,
  ...imageValidationRules,
  ...linkValidationRules,
  ...orderedListValidationRules,
  ...paragraphValidationRules,
  ...tableValidationRules,
  ...unorderedListValidationRules,
} as const;

export type CoreValidationRule = keyof typeof coreValidationRules;

export const coreValidations = {
  ...descriptionListValidations,
  ...headingValidations,
  ...imageValidations,
  ...linkValidations,
  ...orderedListValidations,
  ...paragraphValidations,
  ...tableValidations,
  ...unorderedListValidations,
} satisfies Record<CoreValidationRule, Validation>;
