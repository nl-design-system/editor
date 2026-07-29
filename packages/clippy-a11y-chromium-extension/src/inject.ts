import type { AnalysisResult } from '@nl-design-system-community/clippy-a11y-validator';
import { ClippyValidations } from '@nl-design-system-community/clippy-a11y-validator';
import type { AnalyzeOptions } from './shared';

// This file is bundled as a self-contained IIFE (the validator is inlined) and
// injected into the page via `chrome.scripting.executeScript({ files })`. It
// runs in the extension's isolated world, so the popup can call back into the
// installed `window.__clippyA11y` on the same page.

const HIGHLIGHT_ATTR = 'data-clippy-a11y-highlight';
const HIGHLIGHT_OUTLINE = '3px solid #d5223b';

const resolveRoot = (scopeSelector: string | null): HTMLElement | null =>
  scopeSelector ? document.querySelector<HTMLElement>(scopeSelector) : document.body;

window.__clippyA11y = {
  analyze(options: AnalyzeOptions): AnalysisResult {
    const root = resolveRoot(options.selector);
    if (!root) {
      throw new Error(`clippy-a11y: no element matches selector "${options.selector}".`);
    }
    return new ClippyValidations()
      .withRules(options.enableRules)
      .withoutRules(options.disableRules)
      .withTopHeadingLevel(options.topHeadingLevel)
      .analyze(root);
  },

  analyzeElement(element: Element, options: AnalyzeOptions): AnalysisResult {
    // Validate the element's own markup (via its outerHTML) rather than passing
    // the live element as the root: `runValidation` only walks a root's
    // children, so this is the only way the element itself gets checked.
    return new ClippyValidations()
      .withRules(options.enableRules)
      .withoutRules(options.disableRules)
      .withTopHeadingLevel(options.topHeadingLevel)
      .analyze(element.outerHTML);
  },

  clearHighlights(): void {
    for (const element of document.querySelectorAll<HTMLElement>(`[${HIGHLIGHT_ATTR}]`)) {
      element.style.outline = '';
      element.style.outlineOffset = '';
      element.removeAttribute(HIGHLIGHT_ATTR);
    }
  },

  highlight(scopeSelector: string | null, target: string): void {
    this.clearHighlights();
    const root = resolveRoot(scopeSelector);
    // Targets are relative to the analyzed root's children. For a scoped
    // inspection the sub-target may not resolve, so fall back to the root
    // element itself (the inspected node).
    let element = root?.querySelector<HTMLElement>(`:scope > ${target}`) ?? null;
    if (!element && scopeSelector && root) {
      element = root;
    }
    element ??= document.querySelector<HTMLElement>(target);
    if (!element) return;
    element.setAttribute(HIGHLIGHT_ATTR, 'true');
    element.style.outline = HIGHLIGHT_OUTLINE;
    element.style.outlineOffset = '2px';
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  },
};
