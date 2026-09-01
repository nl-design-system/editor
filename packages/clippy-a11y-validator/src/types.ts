export type ValidationSeverity = 'info' | 'warning' | 'error';

export type ValidationScope = 'block' | 'inline';

export type CorrectValidationFunction = () => void;

export type ValidationResult = {
  validatorKey: string;
  element: HTMLElement;
  scope: ValidationScope;
  severity: ValidationSeverity;
  correct?: CorrectValidationFunction;
};
