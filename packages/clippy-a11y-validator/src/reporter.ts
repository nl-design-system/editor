import type { ValidationReport, ValidationSeverity, ValidationItem } from './types';

/** Severities from most to least severe. */
export const SEVERITY_ORDER: readonly ValidationSeverity[] = ['error', 'warning', 'info'];

const toValidationItems = (input: ValidationReport | ValidationItem[]): ValidationItem[] =>
  Array.isArray(input) ? input : input.validationItems;

/** Count flagged nodes per severity across all validation items. */
export const countBySeverity = (input: ValidationReport | ValidationItem[]): Record<ValidationSeverity, number> => {
  const counts: Record<ValidationSeverity, number> = { error: 0, info: 0, warning: 0 };
  for (const item of toValidationItems(input)) {
    counts[item.severity] += item.nodes.length;
  }
  return counts;
};

/** Whether any validation item is at or above `threshold` (default `'error'`). */
export const hasSeverityAtLeast = (
  input: ValidationReport | ValidationItem[],
  threshold: ValidationSeverity = 'error',
): boolean => {
  const max = SEVERITY_ORDER.indexOf(threshold);
  return toValidationItems(input).some((item) => SEVERITY_ORDER.indexOf(item.severity) <= max);
};

const SEVERITY_LABEL: Record<ValidationSeverity, string> = {
  error: 'error  ',
  info: 'info   ',
  warning: 'warning',
};

/** Render validation items as a human-readable, terminal-friendly report. */
export const formatValidationItems = (input: ValidationReport | ValidationItem[]): string => {
  const validationItems = toValidationItems(input);
  const counts = countBySeverity(validationItems);
  const total = counts.error + counts.warning + counts.info;

  if (total === 0) {
    return 'Clippy a11y validation — no issues found ✓';
  }

  const summary = `Clippy a11y validation — ${total} issue${total === 1 ? '' : 's'} (${counts.error} error, ${counts.warning} warning, ${counts.info} info)`;

  const ordered = [...validationItems].sort(
    (a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity),
  );

  const lines = ordered.flatMap((item) => {
    const head = `  ${SEVERITY_LABEL[item.severity]}  ${item.id} — ${item.description}`;
    const nodeLines = item.nodes.flatMap((node) => [`         at: ${node.target}`, `         ${node.html}`]);
    const href = item.href ? [`         see: ${item.href}`] : [];
    return [head, ...nodeLines, ...href];
  });

  return [summary, '', ...lines].join('\n');
};

/**
 * Throws when any validation item is at or above `failOn` (default `'error'`),
 * for use as a CI gate. The thrown error's message is the formatted report.
 */
export const assertNoValidationItems = (
  input: ValidationReport | ValidationItem[],
  { failOn = 'error' }: { failOn?: ValidationSeverity } = {},
): void => {
  if (hasSeverityAtLeast(input, failOn)) {
    throw new Error(formatValidationItems(input));
  }
};
