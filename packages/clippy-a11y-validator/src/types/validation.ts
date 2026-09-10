import type { ValidationMessagesByLocale, ResolvedMessages } from './messages.ts';
import type { ElementFor, Selector } from './selector.ts';

export type ValidationSeverity = 'error' | 'info' | 'warning';

export type ValidationScope = 'block' | 'inline';

export type ValidationPayload = Readonly<Record<string, boolean | number | string>>;

export type CorrectValidationFunction = () => void;

/**
 * Document-wide settings a validation may need on top of the element and its root.
 *
 * Validations that do not care about the context simply declare fewer parameters —
 * a two-argument condition stays assignable to {@link ValidationCondition}.
 */
export type ValidationContext = {
  /**
   * The highest heading level the document is allowed to use. Documents embedded
   * under an existing outline start at `2` or lower; a standalone document uses `1`.
   */
  topHeadingLevel: number;
};

export type ValidationCondition<E extends HTMLElement = HTMLElement> = (
  element: E,
  root: ParentNode,
  context?: ValidationContext,
) => boolean;

export type ValidationDefinition<S extends Selector = Selector, E extends HTMLElement = ElementFor<S>> = {
  condition: ValidationCondition<E>;
  correct?: (element: E, root: ParentNode, context?: ValidationContext) => CorrectValidationFunction;
  messages: ValidationMessagesByLocale;
  payload?: (element: E, root: ParentNode, context?: ValidationContext) => ValidationPayload;
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
