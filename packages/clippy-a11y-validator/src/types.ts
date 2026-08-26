import type { Locale, Translate } from './locales/types';

export type {
  Locale,
  Solution,
  SolutionParams,
  Translate,
  ValidationEntryTranslations,
  ValidationTranslations,
} from './locales/types';

export type ValidationSeverity = 'info' | 'warning' | 'error';

export type ValidationScope = 'block' | 'inline';

/** A deferred DOM fix for a detected issue. */
export type CorrectValidationFunction = () => void;

/** Detail of the `clippy:open-image-dialog` event the alt-text correction dispatches. */
export type ImageAltTextRequest = {
  files: { name: string; type: string; url: string }[];
  replace: boolean;
};

/**
 * A single detected accessibility issue.
 *
 * The result points at the offending {@link Element} and carries everything a host
 * needs to act on it: `solution`, already translated into the run's locale with
 * this occurrence's values filled in (markdown, so hosts can render emphasis), and
 * — when the rule knows how to fix itself — a deferred
 * {@link CorrectValidationFunction} the detecting validator built. Nothing is
 * mutated until `correct` is called. Consumers derive their own location
 * representation from `element` — a `Range` in a live editor, a CSS selector +
 * HTML snippet for static reporting.
 */
export type ValidationResult = {
  validatorKey?: string;
  element: Element;
  scope: ValidationScope;
  severity: ValidationSeverity;
  solution?: string;
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
  solution?: string;
  correct?: CorrectValidationFunction;
};

/** Settings subset that steers which rules run. Structurally compatible with the editor's `EditorSettings`. */
export type ValidatorSettings = {
  topHeadingLevel?: number;
  enableRules: string[];
  disableRules?: string[];
  locale?: Locale;
};

/**
 * What a validator is handed for one run: the settings, plus a {@link Translate}
 * already bound to `settings.locale`. Validators name a message key and nothing
 * else — the locale never has to be threaded through call by call.
 *
 * Build one with `validationContext(settings)`.
 */
export type ValidationContext = ValidatorSettings & { t: Translate };

/** Runs against a single element during the DOM walk (e.g. one paragraph, one link). */
export type ContentValidator = (
  dom: HTMLElement,
  element: Element,
  context: ValidationContext,
) => ValidationResult | null;

/**
 * Runs once against the whole content tree (e.g. heading order across all headings).
 *
 * Tree validators are exported individually and are useful standalone, so the
 * context is optional here and defaulted by each implementation.
 */
export type TreeValidator = (dom: HTMLElement, context?: ValidationContext) => ValidationResult[];

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

/** One flagged DOM location, in a form usable outside a browser context. */
export type ValidationItemNode = {
  /** A CSS selector that locates the element relative to the validated root. */
  target: string;
  /** The element's `outerHTML`, truncated for readability. */
  html: string;
};

/** What one rule found, with every place it applies — modelled after axe-core's results. */
export type ValidationItem = {
  /** kebab-case rule id, e.g. `image-must-have-alt-text`. */
  id: string;
  severity: ValidationSeverity;
  description: string;
  /** Optional link to NL Design System guidance. */
  href?: string;
  nodes: ValidationItemNode[];
};

export type ValidationReport = {
  validationItems: ValidationItem[];
};
