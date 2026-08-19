/**
 * Worked example: adding a custom validation rule end-to-end.
 *
 * The correction *registry* is deliberately extensible: `extendCorrections`
 * merges your own rule → fix entries onto the built-in `baseCorrections` map,
 * and `buildCorrection` looks a result's fix up in whichever map you hand it.
 * This file shows the full flow — detect, register a fix, then correct — for a
 * rule the package doesn't ship: "a link that opens a new tab should say so".
 *
 * It's referenced from the package README and exercised by
 * `test/examples/customValidation.test.ts`, so it stays runnable.
 */
import type { ContentValidator, ValidationResult } from '@/types';
import { validationSeverity } from '@/constants';
import { type Correction, buildCorrection, extendCorrections } from '@/correctors';

/** Rule id. kebab-case or SCREAMING_SNAKE_CASE both work throughout the pipeline. */
export const LINK_NEW_TAB_SHOULD_WARN = 'LINK_NEW_TAB_SHOULD_WARN';

const NEW_TAB_MENTIONED = /new (tab|window)|opens in/i;
const NEW_TAB_SUFFIX = '(opens in a new tab)';

/**
 * 1. Detection — a `ContentValidator` flags an `<a target="_blank">` whose
 *    accessible name never mentions that it opens a new tab/window (WCAG G201).
 */
export const linkNewTabShouldWarn: ContentValidator = (_dom, node) => {
  if (node.tagName !== 'A' || (node as HTMLAnchorElement).target !== '_blank') return null;
  const accessibleName = node.getAttribute('aria-label') ?? node.textContent ?? '';
  if (NEW_TAB_MENTIONED.test(accessibleName)) return null;
  return { element: node, scope: 'inline', severity: validationSeverity.WARNING };
};

/**
 * 2. Correction — annotate the link so assistive tech announces the behaviour.
 *    A `Correction` receives the offending element (+ any `solutionPayload`) and
 *    returns the deferred DOM mutation, exactly like the built-in fixes.
 */
export const correctLinkNewTabWarning: Correction = (element) => () => {
  const accessibleName = (element.getAttribute('aria-label') ?? element.textContent ?? '').trim();
  element.setAttribute('aria-label', `${accessibleName} ${NEW_TAB_SUFFIX}`.trim());
};

/** 3. Registration — merge the custom fix onto the built-in registry (custom keys win). */
export const correctionsWithCustomRule = extendCorrections([[LINK_NEW_TAB_SHOULD_WARN, correctLinkNewTabWarning]]);

/**
 * 4. Wiring — the built-in `runValidation` only walks the shipped validator maps,
 *    so run a custom detector yourself, then build its fix from the extended
 *    registry. The result shape is identical to the built-in pipeline's.
 */
export const analyzeWithCustomRule = (root: HTMLElement): { result: ValidationResult; correct?: () => void }[] => {
  const found: ValidationResult[] = [];

  const walk = (element: Element): void => {
    const result = linkNewTabShouldWarn(root, element);
    if (result) {
      result.validatorKey = LINK_NEW_TAB_SHOULD_WARN;
      found.push(result);
    }
    for (const child of element.children) walk(child);
  };
  for (const child of root.children) walk(child);

  return found.map((result) => ({ correct: buildCorrection(result, correctionsWithCustomRule), result }));
};
