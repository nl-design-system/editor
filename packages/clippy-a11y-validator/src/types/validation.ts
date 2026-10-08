import type { ByLocale, ValidationMessagesByLocale, ResolvedMessages } from './messages.ts';
import type { ElementFor, Selector } from './selector.ts';

export type ValidationSeverity = 'error' | 'info' | 'warning';

export type ValidationScope = 'element' | 'document';

export type ViolationPayload = Readonly<Record<string, boolean | number | string>>;

export type CorrectViolationFunction = () => void;

export type FocusViolationFunction = () => void;

export type ValidationContext = {
  /** Every earlier match in the document, nearest first, excluding the element's ancestors. */
  precedingMatches: (selector: Selector) => HTMLElement[];
  /** The unbroken run of matching previous siblings, nearest first, stopping at the first non-match. */
  precedingSiblingMatches: (selector: Selector) => HTMLElement[];
  /** Every later match in the document, nearest first, excluding the element's descendants. */
  subsequentMatches: (selector: Selector) => HTMLElement[];
  /** The unbroken run of matching next siblings, nearest first, stopping at the first non-match. */
  subsequentSiblingMatches: (selector: Selector) => HTMLElement[];
};

export type ValidationCondition<E extends HTMLElement = HTMLElement> = (element: E) => boolean;

export type DocumentValidationCondition<E extends HTMLElement = HTMLElement> = (
  element: E,
  context: ValidationContext,
) => boolean;

type SharedValidationDefinition<S extends Selector> = {
  /** The rule in `@nl-design-system-unstable/documentation` that explains this violation, by id. */
  documentationId?: string;
  messages: ValidationMessagesByLocale;
  rule: string;
  selector: S;
  severity: ValidationSeverity;
};

/**
 * A fix the validator can apply itself, and the wording for the control that triggers it. Leave
 * `label` out when the host's default wording is right, which is the case for every rule this
 * package ships.
 *
 * Unlike `messages`, a label is not interpolated with the payload: it is an imperative verb phrase
 * naming an action, not a sentence about the element.
 */
export type ElementValidationCorrection<E extends HTMLElement = HTMLElement> = {
  execute: (element: E) => CorrectViolationFunction;
  label?: ByLocale<string>;
};

/** As {@link ElementValidationCorrection}, for a rule that needs the surrounding document. */
export type DocumentValidationCorrection<E extends HTMLElement = HTMLElement> = {
  execute: (element: E, context: ValidationContext) => CorrectViolationFunction;
  label?: ByLocale<string>;
};

export type ElementValidationDefinition<
  S extends Selector = Selector,
  E extends HTMLElement = ElementFor<S>,
> = SharedValidationDefinition<S> & {
  condition: ValidationCondition<E>;
  correction?: ElementValidationCorrection<E>;
  focus?: (element: E) => FocusViolationFunction;
  payload?: (element: E) => ViolationPayload;
  scope: 'element';
};

export type DocumentValidationDefinition<
  S extends Selector = Selector,
  E extends HTMLElement = ElementFor<S>,
> = SharedValidationDefinition<S> & {
  condition: DocumentValidationCondition<E>;
  correction?: DocumentValidationCorrection<E>;
  focus?: (element: E, context: ValidationContext) => FocusViolationFunction;
  payload?: (element: E, context: ValidationContext) => ViolationPayload;
  scope: 'document';
};

export type ValidationDefinition<S extends Selector = Selector, E extends HTMLElement = ElementFor<S>> =
  ElementValidationDefinition<S, E> | DocumentValidationDefinition<S, E>;

export type ElementValidation = ElementValidationDefinition<Selector, HTMLElement>;

export type DocumentValidation = DocumentValidationDefinition<Selector, HTMLElement>;

export type Validation = ElementValidation | DocumentValidation;

/** The correction a violation carries, with its label already resolved for the active locale. */
export type ViolationCorrection = {
  execute: CorrectViolationFunction;
  label?: string;
};

export type Violation = {
  /** Present only when there is something to run: a correction always has an `execute`. */
  correction?: ViolationCorrection;
  /** The rule in `@nl-design-system-unstable/documentation` that explains this violation, by id. */
  documentationId?: string;
  element: HTMLElement;
  focus?: FocusViolationFunction;
  messages: ResolvedMessages;
  payload?: ViolationPayload;
  rule: string;
  scope: ValidationScope;
  severity: ValidationSeverity;
};
