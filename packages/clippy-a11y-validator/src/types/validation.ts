import type { ValidationMessagesByLocale, ResolvedMessages } from './messages.ts';
import type { ElementFor, Selector } from './selector.ts';

export type ValidationSeverity = 'error' | 'info' | 'warning';

export type ValidationScope = 'block' | 'inline';

export type ValidationPayload = Readonly<Record<string, boolean | number | string>>;

export type CorrectValidationFunction = () => void;

export type ValidationCondition<E extends HTMLElement = HTMLElement> = (element: E, root: ParentNode) => boolean;

export type ValidationDefinition<S extends Selector = Selector, E extends HTMLElement = ElementFor<S>> = {
  condition: ValidationCondition<E>;
  correct?: (element: E, root: ParentNode) => CorrectValidationFunction;
  messages: ValidationMessagesByLocale;
  payload?: (element: E, root: ParentNode) => ValidationPayload;
  rule: string;
  scope: ValidationScope;
  selector: S;
  severity: ValidationSeverity;
};

export type Validation = ValidationDefinition<Selector, HTMLElement>;

export type Violation = {
  correct?: CorrectValidationFunction;
  element: HTMLElement;
  messages: ResolvedMessages;
  payload?: ValidationPayload;
  rule: string;
  scope: ValidationScope;
  severity: ValidationSeverity;
};
