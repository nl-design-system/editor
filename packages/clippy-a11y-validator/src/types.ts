export type ValidationSeverity = 'info' | 'warning' | 'error';

export type ValidationScope = 'block' | 'inline';

/** A deferred DOM fix for a detected issue. */
export type CorrectValidationFunction = () => void;

/** Detail of the `clippy:open-image-dialog` event the alt-text correction dispatches. */
export type ImageAltTextRequest = {
  files: { name: string; type: string; url: string }[];
  replace: boolean;
};

/** Extra structured context a validator can attach for messages / corrections. */
export type SolutionPayload = Record<string, number | string | boolean>;

/**
 * A single detected accessibility issue.
 *
 * The result points at the offending {@link Element}, carries structured context
 * in {@link SolutionPayload}, and — when the rule knows how to fix itself — a
 * deferred {@link CorrectValidationFunction} the detecting validator built. Nothing
 * is mutated until `correct` is called. Consumers derive their own location
 * representation from `element` — a `Range` in a live editor, a CSS selector +
 * HTML snippet for static reporting.
 */
export type ValidationResult = {
  validatorKey?: string;
  element: Element;
  scope: ValidationScope;
  severity: ValidationSeverity;
  solutionPayload?: SolutionPayload;
  correct?: CorrectValidationFunction;
};

/**
 * A detection result enriched for a live editor: keyed by a DOM {@link Range},
 * carrying the deferred {@link CorrectValidationFunction} its validator produced.
 * This is the shape `buildValidationMap` produces; it is structurally compatible
 * with the editor's own `ValidationResult`.
 */
export type ValidationMapResult = {
  validatorKey?: string;
  range?: Range;
  scope?: ValidationScope;
  severity: ValidationSeverity;
  solutionPayload?: SolutionPayload;
  correct?: CorrectValidationFunction;
};

/** Settings subset that steers which rules run. Structurally compatible with the editor's `EditorSettings`. */
export type ValidatorSettings = {
  topHeadingLevel?: number;
  enableRules: string[];
  disableRules?: string[];
};

export type ContentValidator = (dom: HTMLElement, element: Element) => ValidationResult | null;

export type DocumentValidator = (dom: HTMLElement, settings?: ValidatorSettings) => ValidationResult[];

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

/** One offending DOM location, in a form usable outside a browser context. */
export type ViolationNode = {
  /** A CSS selector that locates the element relative to the analyzed root. */
  target: string;
  /** The element's `outerHTML`, truncated for readability. */
  html: string;
};

/** A reported rule violation, grouped by rule — modelled after axe-core's results. */
export type Violation = {
  /** kebab-case rule id, e.g. `image-must-have-alt-text`. */
  id: string;
  severity: ValidationSeverity;
  description: string;
  /** Optional link to NL Design System guidance. */
  href?: string;
  nodes: ViolationNode[];
};

export type AnalysisResult = {
  violations: Violation[];
};
