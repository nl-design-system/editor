import type { AnalysisResult } from '@nl-design-system-community/clippy-a11y-validator';
import type { AnalyzeOptions } from './shared';

declare global {
  interface Window {
    /** Installed on the page by `inject.ts` and called from the popup via `chrome.scripting`. */
    __clippyA11y?: {
      analyze(options: AnalyzeOptions): AnalysisResult;
      analyzeElement(element: Element, options: AnalyzeOptions): AnalysisResult;
      highlight(scopeSelector: string | null, target: string): void;
      clearHighlights(): void;
    };
    /** The element most recently right-clicked, recorded by the `tracker` content script. */
    __clippyLastRightClicked?: Element | null;
  }
}

export {};
