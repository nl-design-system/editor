// ── Playwright entry point (AxeBuilder-style) ──────────────────────────────────
export { ClippyBuilder, default } from './builder';
export type { ClippyBuilderOptions } from './builder';

// ── Reporting helpers (re-exported from the validator core; DOM-free, run in Node) ──
export {
  SEVERITY_ORDER,
  assertNoValidationItems,
  countBySeverity,
  formatValidationItems,
  hasSeverityAtLeast,
} from '@nl-design-system-community/clippy-a11y-validator';

// ── Types ──────────────────────────────────────────────────────────────────────
export type {
  ValidationReport,
  ValidationSeverity,
  ValidationItem,
  ValidationItemNode,
} from '@nl-design-system-community/clippy-a11y-validator';
