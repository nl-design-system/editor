import type { AnalysisResult, ValidationResult, Violation } from './types';
import { validationMessages, type ValidationKey } from './messages';
import { runValidation } from './validators';

const SNIPPET_MAX_LENGTH = 160;

/** Convert a canonical rule key (`HEADING_MUST_NOT_BE_EMPTY`) to a kebab-case id. */
export const toKebabId = (key: string): string => key.toLowerCase().replaceAll('_', '-');

/** One selector segment for an element, disambiguated by `:nth-of-type` among same-tag siblings. */
const selectorSegment = (element: Element): string => {
  const tag = element.tagName.toLowerCase();
  const parent = element.parentElement;
  if (!parent) return tag;
  const sameTag = Array.from(parent.children).filter((child) => child.tagName === element.tagName);
  return sameTag.length > 1 ? `${tag}:nth-of-type(${sameTag.indexOf(element) + 1})` : tag;
};

/** Build a CSS selector locating `element` relative to `root`. */
const cssSelector = (element: Element, root: Element): string => {
  const parts: string[] = [];
  let current: Element | null = element;

  while (current && current !== root) {
    parts.unshift(selectorSegment(current));
    current = current.parentElement;
  }

  return parts.length > 0 ? parts.join(' > ') : element.tagName.toLowerCase();
};

/** A short, single-line preview of an element's markup for reporting. */
const htmlSnippet = (element: Element): string => {
  const html = element.outerHTML.replace(/\s+/g, ' ').trim();
  return html.length > SNIPPET_MAX_LENGTH ? `${html.slice(0, SNIPPET_MAX_LENGTH)}…` : html;
};

/** Parse an HTML string into a detached `<body>` element for analysis. */
const parseHtml = (html: string): HTMLElement => new DOMParser().parseFromString(html, 'text/html').body;

/**
 * Groups raw detection results into per-rule violations.
 *
 * Results are keyed by rule id *and* severity, so a rule that can report at
 * more than one severity (e.g. heading order) yields one violation entry per
 * severity rather than silently collapsing to the first.
 */
const groupViolations = (results: ValidationResult[], root: Element): Violation[] => {
  const byKey = new Map<string, Violation>();

  for (const result of results) {
    if (!result.validatorKey) continue;
    const id = toKebabId(result.validatorKey);
    const groupKey = `${id}::${result.severity}`;

    let violation = byKey.get(groupKey);
    if (!violation) {
      const message = validationMessages[result.validatorKey as ValidationKey];
      violation = {
        id,
        description: message?.description ?? id,
        href: message?.href,
        nodes: [],
        severity: result.severity,
      };
      byKey.set(groupKey, violation);
    }

    violation.nodes.push({ html: htmlSnippet(result.element), target: cssSelector(result.element, root) });
  }

  return [...byKey.values()];
};

/**
 * Fluent, `AxeBuilder`-style entry point for static accessibility analysis of
 * HTML. Runs the same detection rules the Clippy editor uses, but with no
 * editor, ProseMirror, or localisation dependencies.
 *
 * @example
 * ```ts
 * const { violations } = new ClippyValidations()
 *   .withRules(['image-must-have-alt-text'])
 *   .analyze('<img src="cat.png">');
 * ```
 */
export class ClippyValidations {
  #enableRules: string[] = ['*'];
  #disableRules: string[] = [];
  #topHeadingLevel = 1;

  /** Limit analysis to the given rules (kebab-case or SCREAMING_SNAKE_CASE). Defaults to all rules. */
  withRules(rules: string[]): this {
    this.#enableRules = rules;
    return this;
  }

  /** Exclude the given rules from analysis. */
  withoutRules(rules: string[]): this {
    this.#disableRules = rules;
    return this;
  }

  /** Set the highest heading level the document is allowed to start at (default 1). */
  withTopHeadingLevel(level: number): this {
    this.#topHeadingLevel = level;
    return this;
  }

  /** Analyze an HTML string or a live element and return grouped violations. */
  analyze(input: string | HTMLElement): AnalysisResult {
    const root = typeof input === 'string' ? parseHtml(input) : input;
    const results = runValidation(root, {
      disableRules: this.#disableRules,
      enableRules: this.#enableRules,
      topHeadingLevel: this.#topHeadingLevel,
    });
    return { violations: groupViolations(results, root) };
  }
}
