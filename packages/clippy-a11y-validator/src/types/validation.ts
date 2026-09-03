import type { ValidationMessagesByLocale, ResolvedMessages } from './messages.ts';
import type { ElementFor, Selector } from './selector.ts';

export type ValidationSeverity = 'error' | 'info' | 'warning';

export type ValidationScope = 'block' | 'inline';

export type ValidationPayload = Readonly<Record<string, boolean | number | string>>;

export type CorrectValidationFunction = () => void;

export type ValidationRule<E extends HTMLElement = HTMLElement> = (element: E) => boolean;

export type ValidationDefinition<S extends Selector = Selector, E extends HTMLElement = ElementFor<S>> = {
  correct?: (element: E) => CorrectValidationFunction;
  key: string;
  messages: ValidationMessagesByLocale;
  payload?: (element: E) => ValidationPayload;
  rule: ValidationRule<E>;
  scope: ValidationScope;
  selector: S;
  severity: ValidationSeverity;
};

export type Validation = ValidationDefinition<Selector, HTMLElement>;

export type Violation = {
  correct?: CorrectValidationFunction;
  element: HTMLElement;
  key: string;
  messages: ResolvedMessages;
  payload?: ValidationPayload;
  scope: ValidationScope;
  severity: ValidationSeverity;
};
