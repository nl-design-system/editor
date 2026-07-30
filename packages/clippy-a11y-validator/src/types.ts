export type ValidationSeverity = 'info' | 'warning' | 'error';

export type ValidationScope = 'block' | 'inline';

/** Extra structured context a validator can attach for messages / corrections. */
export type TipPayload = Record<string, number | string | boolean>;

/**
 * A single detected accessibility issue.
 *
 * Detection is intentionally decoupled from correction: the result points at the
 * offending {@link Element} and carries structured context in {@link TipPayload},
 * but knows nothing about how (or whether) the issue is fixed. Consumers derive
 * their own location representation from `element` — a `Range` in a live editor,
 * a CSS selector + HTML snippet for static reporting.
 */
export type ValidationResult = {
  validatorKey?: string;
  element: Element;
  scope: ValidationScope;
  severity: ValidationSeverity;
  tipPayload?: TipPayload;
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
  /**
   * Structured context forwarded from the detection, so consumers can render
   * the same localised guidance tip the editor shows (keyed by {@link Violation.validatorKey}).
   */
  tipPayload?: TipPayload;
};

/** A reported rule violation, grouped by rule — modelled after axe-core's results. */
export type Violation = {
  /** kebab-case rule id, e.g. `image-must-have-alt-text`. */
  id: string;
  /** Canonical rule key (e.g. `IMAGE_MUST_HAVE_ALT_TEXT`), for message/tip lookup. */
  validatorKey: string;
  severity: ValidationSeverity;
  description: string;
  /** Optional link to NL Design System guidance. */
  href?: string;
  nodes: ViolationNode[];
};

export type AnalysisResult = {
  violations: Violation[];
};
