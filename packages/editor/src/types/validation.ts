import type { validationInteractionMode } from '@/constants';
import type { EditorSettings } from '@/types/settings';

export type DocumentValidator = (dom: HTMLElement, settings: EditorSettings) => ValidationResult[];

export type ContentValidator = (dom: HTMLElement, element: Element) => ValidationResult | null;

export type ValidationEntry = readonly [range: Range, value: ValidationResult];

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
