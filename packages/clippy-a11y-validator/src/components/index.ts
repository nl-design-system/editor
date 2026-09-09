import type { Validation } from '../types/validation.ts';
import { descriptionListValidationRules } from './description-list/constants.ts';
import { descriptionListValidations } from './description-list/index.ts';
import { emphasisValidationRules } from './emphasis/constants.ts';
import { emphasisValidations } from './emphasis/index.ts';
import { headingValidationRules } from './heading/constants.ts';
import { headingValidations } from './heading/index.ts';
import { imageValidationRules } from './image/constants.ts';
import { imageValidations } from './image/index.ts';
import { linkValidationRules } from './link/constants.ts';
import { linkValidations } from './link/index.ts';
import { listValidationRules } from './list/constants.ts';
import { listValidations } from './list/index.ts';
import { paragraphValidationRules } from './paragraph/constants.ts';
import { paragraphValidations } from './paragraph/index.ts';
import { tableValidationRules } from './table/constants.ts';
import { tableValidations } from './table/index.ts';

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
