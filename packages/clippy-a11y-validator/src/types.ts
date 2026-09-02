export type ValidationSeverity = 'info' | 'warning' | 'error';

export type ValidationScope = 'block' | 'inline';

export type CorrectValidationFunction = () => void;

export type ValidationCondition = (element: HTMLElement) => boolean;

export type ValidationRule = (element: HTMLElement) => boolean;

export type Validator = {
  conditions?: readonly ValidationCondition[];
  correct?: (element: HTMLElement) => CorrectValidationFunction;
  rules: readonly ValidationRule[];
  scope: ValidationScope;
  selector: string;
  severity: ValidationSeverity;
  validatorKey: string;
};

export type ValidationResult = {
  correct?: CorrectValidationFunction;
  element: HTMLElement;
  scope: ValidationScope;
  severity: ValidationSeverity;
  validatorKey: string;
};
