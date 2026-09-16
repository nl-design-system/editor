import type { Validation } from '../types/validation.ts';
import { descriptionListValidationRules, descriptionListValidations } from './description-list/index.ts';
import { emphasisValidationRules, emphasisValidations } from './emphasis/index.ts';
import { headingValidationRules, headingValidations } from './heading/index.ts';
import { imageValidationRules, imageValidations } from './image/index.ts';
import { linkValidationRules, linkValidations } from './link/index.ts';
import { listValidationRules, listValidations } from './list/index.ts';
import { paragraphValidationRules, paragraphValidations } from './paragraph/index.ts';
import { tableValidationRules, tableValidations } from './table/index.ts';

export const coreValidationRules = {
  ...descriptionListValidationRules,
  ...emphasisValidationRules,
  ...headingValidationRules,
  ...imageValidationRules,
  ...linkValidationRules,
  ...listValidationRules,
  ...paragraphValidationRules,
  ...tableValidationRules,
} as const;

export type CoreValidationRule = keyof typeof coreValidationRules;

export const coreValidations = {
  ...descriptionListValidations,
  ...emphasisValidations,
  ...headingValidations,
  ...imageValidations,
  ...linkValidations,
  ...listValidations,
  ...paragraphValidations,
  ...tableValidations,
} satisfies Record<CoreValidationRule, Validation>;
