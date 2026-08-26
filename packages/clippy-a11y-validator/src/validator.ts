import type { Locale } from './locales/types';
import type { ValidationKey } from './messages';
import type { ValidationReport, ValidationResult, ValidatorSettings, ValidationItem } from './types';
import { runValidation } from './detection';
import { translator } from './i18n';

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

/** Parse an HTML string into a detached `<body>` element for validation. */
const parseHtml = (html: string): HTMLElement => new DOMParser().parseFromString(html, 'text/html').body;

/**
 * Groups raw detection results into one validation item per rule.
 *
 * Results are keyed by rule id *and* severity, so a rule that can report at
 * more than one severity (e.g. heading order) yields one item entry per
 * severity rather than silently collapsing to the first.
 */
const groupValidationItems = (results: ValidationResult[], root: Element, locale?: Locale): ValidationItem[] => {
  const byKey = new Map<string, ValidationItem>();
  const t = translator(locale);

  for (const result of results) {
    if (!result.validatorKey) continue;
    const id = toKebabId(result.validatorKey);
    const groupKey = `${id}::${result.severity}`;

    let item = byKey.get(groupKey);
    if (!item) {
      const key = result.validatorKey as ValidationKey;
      item = {
        id,
        description: t(`${key}.description`) ?? id,
        href: t(`${key}.href`),
        nodes: [],
        severity: result.severity,
      };
      byKey.set(groupKey, item);
    }

    item.nodes.push({ html: htmlSnippet(result.element), target: cssSelector(result.element, root) });
  }

  return [...byKey.values()];
};

/**
 * Fluent, `AxeBuilder`-style entry point for static accessibility validation of
 * HTML. Runs the same detection rules the Clippy editor uses, but with no
 * editor, ProseMirror, or localisation dependencies.
 *
 * @example
 * ```ts
 * const { validationItems } = new ClippyValidator()
 *   .enableRules(['image-must-have-alt-text'])
 *   .validate('<img src="cat.png">');
 * ```
 */
export class ClippyValidator {
  #enableRules: string[] = ['*'];
  #disableRules: string[] = [];
  #topHeadingLevel = 1;
  #locale: Locale | undefined;

  /** Limit validation to the given rules (kebab-case or SCREAMING_SNAKE_CASE). Defaults to all rules. */
  enableRules(rules: string[]): this {
    this.#enableRules = rules;
    return this;
  }

  /** Exclude the given rules from validation. */
  disableRules(rules: string[]): this {
    this.#disableRules = rules;
    return this;
  }

  /**
   * Apply non-rule validation settings: `topHeadingLevel` (highest allowed starting
   * heading level, default 1) and `locale` for the reported text (default `'en'`).
   */
  settings(settings: Partial<Pick<ValidatorSettings, 'locale' | 'topHeadingLevel'>>): this {
    if (settings.topHeadingLevel !== undefined) {
      this.#topHeadingLevel = settings.topHeadingLevel;
    }
    if (settings.locale !== undefined) {
      this.#locale = settings.locale;
    }
    return this;
  }

  /** Validate an HTML string or a live element and return grouped validation items. */
  validate(input: string | HTMLElement): ValidationReport {
    const root = typeof input === 'string' ? parseHtml(input) : input;
    const results = runValidation(root, {
      disableRules: this.#disableRules,
      enableRules: this.#enableRules,
      locale: this.#locale,
      topHeadingLevel: this.#topHeadingLevel,
    });
    return { validationItems: groupValidationItems(results, root, this.#locale) };
  }
}
