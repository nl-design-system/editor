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
  /** The rule in `@nl-design-system-unstable/documentation` that fills in what `messages` leaves out. */
  documentationId?: string;
  messages: ValidationMessagesByLocale;
  rule: string;
  selector: S;
  severity: ValidationSeverity;
};

/**
 * A fix the validator can apply itself, and the wording for the control that triggers it. Leave
 * `label` out only when the host's default wording is right; every rule this package ships labels
 * its corrections.
 *
 * Like `messages`, a label can name payload values as `{key}` placeholders; they go in as plain
 * text. A label is an imperative verb phrase naming an action, not a sentence about the element.
 */
export type ElementValidationCorrection<E extends HTMLElement = HTMLElement> = {
  /**
   * `true` when the correction fits this element; unlike a validation's `condition`, which is `true`
   * when the element is fine. Leave it out when the correction always fits.
   */
  condition?: (element: E, context: ValidationContext) => boolean;
  execute: (element: E, context: ValidationContext) => CorrectViolationFunction;
  label?: ByLocale<string>;
  /** The id of the solution in the rule's documentation that this correction carries out. */
  solutionId?: string;
};

/** A correction receives the surrounding document whatever the scope of its rule. */
export type DocumentValidationCorrection<E extends HTMLElement = HTMLElement> = ElementValidationCorrection<E>;

export type ElementValidationCorrectionList<E extends HTMLElement = HTMLElement> = ElementValidationCorrection<E>[];

export type DocumentValidationCorrectionList<E extends HTMLElement = HTMLElement> = DocumentValidationCorrection<E>[];

export type ElementValidationDefinition<
  S extends Selector = Selector,
  E extends HTMLElement = ElementFor<S>,
> = SharedValidationDefinition<S> & {
  condition: ValidationCondition<E>;
  corrections?: ElementValidationCorrectionList<E>;
  focus?: (element: E) => FocusViolationFunction;
  payload?: (element: E) => ViolationPayload;
  scope: 'element';
};

export type DocumentValidationDefinition<
  S extends Selector = Selector,
  E extends HTMLElement = ElementFor<S>,
> = SharedValidationDefinition<S> & {
  condition: DocumentValidationCondition<E>;
  corrections?: DocumentValidationCorrectionList<E>;
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
  solutionId?: string;
};

export type ViolationCorrectionList = ViolationCorrection[];

export type Violation = {
  /** Present only when there is something to run, primary first: a correction always has an `execute`. */
  corrections?: ViolationCorrectionList;
  element: HTMLElement;
  focus?: FocusViolationFunction;
  messages: ResolvedMessages;
  payload?: ViolationPayload;
  rule: string;
  scope: ValidationScope;
  severity: ValidationSeverity;
};
