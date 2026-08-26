/**
 * Worked example: adding a custom validation rule end-to-end.
 *
 * A validator owns both halves of its rule: it detects the problem *and* attaches
 * the deferred fix as `correct` on the result it returns. There is no separate
 * registry to keep in sync — whatever built the result already knows how to fix it.
 * This file shows the full flow for a rule the package doesn't ship: "a link that
 * opens a new tab should say so".
 *
 * It's referenced from the package README and exercised by
 * `test/examples/customValidation.test.ts`, so it stays runnable.
 */
import type { ContentValidator, ValidationResult } from '@/types';
import { validationSeverity } from '@/constants';
import { walkElements } from '@/helpers';
import { runValidators } from '@/validators';

/** Rule id. kebab-case or SCREAMING_SNAKE_CASE both work throughout the pipeline. */
export const LINK_NEW_TAB_SHOULD_WARN = 'LINK_NEW_TAB_SHOULD_WARN';

const NEW_TAB_MENTIONED = /new (tab|window)|opens in/i;
const NEW_TAB_SUFFIX = '(opens in a new tab)';

/**
 * 1. Correction — annotate the link so assistive tech announces the behaviour.
 *    Like the built-in `correct*` functions, it takes the offending element and
 *    returns the deferred DOM mutation; nothing changes until it is called.
 */
export const correctLinkNewTabWarning =
  (element: Element): (() => void) =>
  () => {
    const accessibleName = (element.getAttribute('aria-label') ?? element.textContent ?? '').trim();
    element.setAttribute('aria-label', `${accessibleName} ${NEW_TAB_SUFFIX}`.trim());
  };

/**
 * 2. Detection — a `ContentValidator` flags an `<a target="_blank">` whose
 *    accessible name never mentions that it opens a new tab/window (WCAG G201),
 *    and hands back its own fix on the result.
 */
export const linkNewTabShouldWarn: ContentValidator = (_dom, node) => {
  if (node.tagName !== 'A' || (node as HTMLAnchorElement).target !== '_blank') return null;
  const accessibleName = node.getAttribute('aria-label') ?? node.textContent ?? '';
  if (NEW_TAB_MENTIONED.test(accessibleName)) return null;
  return {
    correct: correctLinkNewTabWarning(node),
    element: node,
    scope: 'inline',
    severity: validationSeverity.WARNING,
  };
};

/**
 * 3. Wiring — the built-in `runValidation` only walks the shipped validator maps,
 *    so run a custom detector yourself, over the same walker and result collector
 *    the built-in pipeline uses. The result shape is identical, fix included.
 */
export const validateWithCustomRule = (root: HTMLElement): ValidationResult[] =>
  [...walkElements(root)].flatMap((element) =>
    runValidators<[HTMLElement, Element]>([[LINK_NEW_TAB_SHOULD_WARN, linkNewTabShouldWarn]], root, element),
  );
