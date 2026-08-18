// ── Playwright entry point (AxeBuilder-style) ──────────────────────────────────
export { ClippyBuilder, default } from './builder';
export type { ClippyBuilderOptions } from './builder';

// ── Reporting helpers (re-exported from the validator core; DOM-free, run in Node) ──
export {
  SEVERITY_ORDER,
  assertNoViolations,
  countBySeverity,
  formatViolations,
  hasSeverityAtLeast,
} from '@nl-design-system-community/clippy-a11y-validator';

// ── Types ──────────────────────────────────────────────────────────────────────
export type {
  AnalysisResult,
  ValidationSeverity,
  Violation,
  ViolationNode,
} from '@nl-design-system-community/clippy-a11y-validator';
