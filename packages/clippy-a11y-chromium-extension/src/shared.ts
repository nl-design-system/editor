import type { AnalysisResult } from '@nl-design-system-community/clippy-a11y-validator';

/** Options passed from the popup into the page to steer a single analysis run. */
export type AnalyzeOptions = {
  /** CSS selector to scope analysis to, or `null` to analyze `document.body`. */
  selector: string | null;
  enableRules: string[];
  disableRules: string[];
  topHeadingLevel: number;
};

/** Result of a right-click "inspect element" run, handed from the service worker to the popup. */
export type InspectionPayload = {
  result: AnalysisResult;
  /** Human-readable descriptor of the inspected element, e.g. `img.hero`. */
  label: string;
  /** Selector the popup uses to re-locate the inspected element for highlighting. */
  scopeSelector: string;
  /** Toolbar badge text (offending-node count). */
  badge: string;
};
