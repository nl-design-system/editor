import type { Validation } from '../types/validation.ts';
import { paragraphValidationRules } from './paragraph/constants.ts';
import { paragraphValidations } from './paragraph/index.ts';

export const coreValidationRules = {
  ...paragraphValidationRules,
} as const;

export type CoreValidationRule = keyof typeof coreValidationRules;

export const coreValidations = {
  ...paragraphValidations,
} satisfies Record<CoreValidationRule, Validation>;
