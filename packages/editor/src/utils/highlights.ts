import type { ValidationSeverity, ValidationsMap } from '@/types/validation.ts';

export const VALIDATION_HIGHLIGHT_NAMES = {
  error: 'clippy-validation-error',
  'hover-error': 'clippy-validation-hover-error',
  'hover-info': 'clippy-validation-hover-info',
  'hover-warning': 'clippy-validation-hover-warning',
  info: 'clippy-validation-info',
  warning: 'clippy-validation-warning',
} as const;

const HIGHLIGHT_PRIORITY: Record<ValidationSeverity, number> = {
  error: 2,
  info: 0,
  warning: 1,
};

export const applyValidationHighlights = (validationsMap: ValidationsMap): void => {
  if (typeof CSS === 'undefined' || !('highlights' in CSS)) return;

  clearValidationHighlights();

  const rangesBySeverity: Record<ValidationSeverity, Range[]> = {
    error: [],
    info: [],
    warning: [],
  };

  for (const result of validationsMap.values()) {
    if (result.range && result.scope === 'inline') {
      rangesBySeverity[result.severity].push(result.range);
    }
  }

  for (const [severity, ranges] of Object.entries(rangesBySeverity) as [ValidationSeverity, Range[]][]) {
    if (ranges.length === 0) continue;
    const highlight = new Highlight(...ranges);
    highlight.priority = HIGHLIGHT_PRIORITY[severity];
    CSS.highlights.set(VALIDATION_HIGHLIGHT_NAMES[severity], highlight);
  }
};

export const clearValidationHighlights = (): void => {
  if (typeof CSS === 'undefined' || !('highlights' in CSS)) return;
  for (const name of Object.values(VALIDATION_HIGHLIGHT_NAMES)) {
    CSS.highlights.delete(name);
  }
};

export const applyHoverHighlight = (severity: ValidationSeverity, range: Range): void => {
  if (typeof CSS === 'undefined' || !('highlights' in CSS)) return;
  const name = VALIDATION_HIGHLIGHT_NAMES[`hover-${severity}`];
  const highlight = new Highlight(range);
  highlight.priority = HIGHLIGHT_PRIORITY[severity] + 10;
  CSS.highlights.set(name, highlight);
};

export const clearHoverHighlight = (): void => {
  if (typeof CSS === 'undefined' || !('highlights' in CSS)) return;
  CSS.highlights.delete(VALIDATION_HIGHLIGHT_NAMES['hover-error']);
  CSS.highlights.delete(VALIDATION_HIGHLIGHT_NAMES['hover-warning']);
  CSS.highlights.delete(VALIDATION_HIGHLIGHT_NAMES['hover-info']);
};
