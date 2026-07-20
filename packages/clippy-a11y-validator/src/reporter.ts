import type { AnalysisResult, ValidationSeverity, Violation } from './types';

/** Severities from most to least severe. */
export const SEVERITY_ORDER: readonly ValidationSeverity[] = ['error', 'warning', 'info'];

const toViolations = (input: AnalysisResult | Violation[]): Violation[] =>
  Array.isArray(input) ? input : input.violations;

/** Count offending nodes per severity across all violations. */
export const countBySeverity = (input: AnalysisResult | Violation[]): Record<ValidationSeverity, number> => {
  const counts: Record<ValidationSeverity, number> = { error: 0, info: 0, warning: 0 };
  for (const violation of toViolations(input)) {
    counts[violation.severity] += violation.nodes.length;
  }
  return counts;
};

/** Whether any violation is at or above `threshold` (default `'error'`). */
export const hasSeverityAtLeast = (
  input: AnalysisResult | Violation[],
  threshold: ValidationSeverity = 'error',
): boolean => {
  const max = SEVERITY_ORDER.indexOf(threshold);
  return toViolations(input).some((violation) => SEVERITY_ORDER.indexOf(violation.severity) <= max);
};

const SEVERITY_LABEL: Record<ValidationSeverity, string> = {
  error: 'error  ',
  info: 'info   ',
  warning: 'warning',
};

/** Render violations as a human-readable, terminal-friendly report. */
export const formatViolations = (input: AnalysisResult | Violation[]): string => {
  const violations = toViolations(input);
  const counts = countBySeverity(violations);
  const total = counts.error + counts.warning + counts.info;

  if (total === 0) {
    return 'Clippy a11y validation — no issues found ✓';
  }

  const summary = `Clippy a11y validation — ${total} issue${total === 1 ? '' : 's'} (${counts.error} error, ${counts.warning} warning, ${counts.info} info)`;

  const ordered = [...violations].sort(
    (a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity),
  );

  const lines = ordered.flatMap((violation) => {
    const head = `  ${SEVERITY_LABEL[violation.severity]}  ${violation.id} — ${violation.description}`;
    const nodeLines = violation.nodes.flatMap((node) => [`         at: ${node.target}`, `         ${node.html}`]);
    const href = violation.href ? [`         see: ${violation.href}`] : [];
    return [head, ...nodeLines, ...href];
  });

  return [summary, '', ...lines].join('\n');
};

/**
 * Throws when any violation is at or above `failOn` (default `'error'`),
 * for use as a CI gate. The thrown error's message is the formatted report.
 */
export const assertNoViolations = (
  input: AnalysisResult | Violation[],
  { failOn = 'error' }: { failOn?: ValidationSeverity } = {},
): void => {
  if (hasSeverityAtLeast(input, failOn)) {
    throw new Error(formatViolations(input));
  }
};
