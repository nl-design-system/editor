import type { validationInteractionMode } from '@/constants';

export type CorrectValidationFunction = () => void;

export type ValidationScope = 'block' | 'inline';

export type ValidationInteractionMode = (typeof validationInteractionMode)[keyof typeof validationInteractionMode];

export type ValidationResult = {
  validatorKey?: string;
  range?: Range;
  scope?: ValidationScope;
  severity: ValidationSeverity;
  tipPayload?: Record<string, number | string | boolean>;
  correct?: CorrectValidationFunction;
};

export type ValidationSeverity = 'info' | 'warning' | 'error';
export type ValidationsMap = Map<Range, ValidationResult>;
