import type { ValidationMessagesByLocale, ResolvedMessages } from './messages.ts';
import type { ElementFor, Selector } from './selector.ts';

export type ValidationSeverity = 'error' | 'info' | 'warning';

export type ValidationScope = 'element' | 'page';

export type ValidationPayload = Readonly<Record<string, boolean | number | string>>;

export type CorrectValidationFunction = () => void;

export type ValidationContext = {
  /** Every earlier match in the page, nearest first, excluding the element's ancestors. */
  precedingMatches: (selector: Selector) => HTMLElement[];
  /** The unbroken run of matching previous siblings, nearest first, stopping at the first non-match. */
  precedingSiblingMatches: (selector: Selector) => HTMLElement[];
  /** Every later match in the page, nearest first, excluding the element's descendants. */
  subsequentMatches: (selector: Selector) => HTMLElement[];
  /** The unbroken run of matching next siblings, nearest first, stopping at the first non-match. */
  subsequentSiblingMatches: (selector: Selector) => HTMLElement[];
};

export type ValidationCondition<E extends HTMLElement = HTMLElement> = (element: E) => boolean;

export type PageValidationCondition<E extends HTMLElement = HTMLElement> = (
  element: E,
  context: ValidationContext,
) => boolean;

type SharedValidationDefinition<S extends Selector> = {
  messages: ValidationMessagesByLocale;
  rule: string;
  selector: S;
  severity: ValidationSeverity;
};

export type ElementValidationDefinition<
  S extends Selector = Selector,
  E extends HTMLElement = ElementFor<S>,
> = SharedValidationDefinition<S> & {
  condition: ValidationCondition<E>;
  correct?: (element: E) => CorrectValidationFunction;
  payload?: (element: E) => ValidationPayload;
  scope: 'element';
};

export type PageValidationDefinition<
  S extends Selector = Selector,
  E extends HTMLElement = ElementFor<S>,
> = SharedValidationDefinition<S> & {
  condition: PageValidationCondition<E>;
  correct?: (element: E, context: ValidationContext) => CorrectValidationFunction;
  payload?: (element: E, context: ValidationContext) => ValidationPayload;
  scope: 'page';
};

export type ValidationDefinition<S extends Selector = Selector, E extends HTMLElement = ElementFor<S>> =
  ElementValidationDefinition<S, E> | PageValidationDefinition<S, E>;

export type ElementValidation = ElementValidationDefinition<Selector, HTMLElement>;

export type PageValidation = PageValidationDefinition<Selector, HTMLElement>;

export type Validation = ElementValidation | PageValidation;

export type Violation = {
  correct?: CorrectValidationFunction;
  element: HTMLElement;
  messages: ResolvedMessages;
  payload?: ValidationPayload;
  rule: string;
  scope: ValidationScope;
  severity: ValidationSeverity;
};
