import { isEmptyOrWhitespace } from '@nl-design-system-community/clippy-a11y-validator';
import type { ValidationSeverity, ValidationsMap } from '@/types/validation';
import { validationSeverity } from '@/constants';

export const VALIDATION_HIGHLIGHT_NAMES = {
  [validationSeverity.ERROR]: 'clippy-validation-error',
  [validationSeverity.INFO]: 'clippy-validation-info',
  [validationSeverity.WARNING]: 'clippy-validation-warning',
} as const satisfies Record<ValidationSeverity, string>;

export const VALIDATION_BLANK_HIGHLIGHT_NAMES = {
  [validationSeverity.ERROR]: 'clippy-validation-blank-error',
  [validationSeverity.INFO]: 'clippy-validation-blank-info',
  [validationSeverity.WARNING]: 'clippy-validation-blank-warning',
} as const satisfies Record<ValidationSeverity, string>;

export const VALIDATION_HOVER_HIGHLIGHT_NAMES = {
  [validationSeverity.ERROR]: 'clippy-validation-hover-error',
  [validationSeverity.INFO]: 'clippy-validation-hover-info',
  [validationSeverity.WARNING]: 'clippy-validation-hover-warning',
} as const satisfies Record<ValidationSeverity, string>;

const HIGHLIGHT_PRIORITY: Record<ValidationSeverity, number> = {
  [validationSeverity.ERROR]: 2,
  [validationSeverity.INFO]: 0,
  [validationSeverity.WARNING]: 1,
};

const HOVER_PRIORITY_OFFSET = 10;

const SEVERITIES: ValidationSeverity[] = [
  validationSeverity.ERROR,
  validationSeverity.WARNING,
  validationSeverity.INFO,
];

const HIGHLIGHT_CSS = `
  ::highlight(${VALIDATION_HIGHLIGHT_NAMES.error}) {
    color: inherit;
    background-color: color-mix(in srgb, var(--basis-color-negative-border-default) 20%, transparent);
    text-decoration-line: overline;
    text-decoration-style: double;
    text-decoration-color: var(--basis-color-negative-border-default);
  }
  ::highlight(${VALIDATION_HIGHLIGHT_NAMES.warning}) {
    color: inherit;
    background-color: color-mix(in srgb, var(--basis-color-warning-border-default) 20%, transparent);
    text-decoration-line: overline;
    text-decoration-style: solid;
    text-decoration-color: var(--basis-color-warning-border-default);
  }
  ::highlight(${VALIDATION_HIGHLIGHT_NAMES.info}) {
    color: inherit;
    background-color: color-mix(in srgb, var(--basis-color-info-border-default) 20%, transparent);
    text-decoration-line: overline;
    text-decoration-style: dotted;
    text-decoration-color: var(--basis-color-info-border-default);
  }
  ::highlight(${VALIDATION_HOVER_HIGHLIGHT_NAMES.error}) {
    color: inherit;
    background-color: color-mix(in srgb, var(--basis-color-negative-border-default) 40%, transparent);
    text-decoration-line: overline;
    text-decoration-style: double;
    text-decoration-color: var(--basis-color-negative-border-default);
  }
  ::highlight(${VALIDATION_HOVER_HIGHLIGHT_NAMES.warning}) {
    color: inherit;
    background-color: color-mix(in srgb, var(--basis-color-warning-border-default) 40%, transparent);
    text-decoration-line: overline;
    text-decoration-style: solid;
    text-decoration-color: var(--basis-color-warning-border-default);
  }
  ::highlight(${VALIDATION_HOVER_HIGHLIGHT_NAMES.info}) {
    color: inherit;
    background-color: color-mix(in srgb, var(--basis-color-info-border-default) 40%, transparent);
    text-decoration-line: overline;
    text-decoration-style: dotted;
    text-decoration-color: var(--basis-color-info-border-default);
  }
  ::highlight(${VALIDATION_BLANK_HIGHLIGHT_NAMES.error}) {
    color: inherit;
    background-color: var(--basis-color-negative-border-default);
  }
  ::highlight(${VALIDATION_BLANK_HIGHLIGHT_NAMES.warning}) {
    color: inherit;
    background-color: var(--basis-color-warning-border-default);
  }
  ::highlight(${VALIDATION_BLANK_HIGHLIGHT_NAMES.info}) {
    color: inherit;
    background-color: var(--basis-color-info-border-default);
  }
`;

let highlightSheet: CSSStyleSheet | undefined;

const getHighlightSheet = (): CSSStyleSheet => {
  if (!highlightSheet) {
    highlightSheet = new CSSStyleSheet();
    highlightSheet.replaceSync(HIGHLIGHT_CSS);
  }
  return highlightSheet;
};

const ensureHighlightStyles = (range: Range): void => {
  const root = range.startContainer.getRootNode();
  if (!(root instanceof Document || root instanceof ShadowRoot)) return;
  const sheet = getHighlightSheet();
  if (!root.adoptedStyleSheets.includes(sheet)) {
    root.adoptedStyleSheets = [...root.adoptedStyleSheets, sheet];
  }
};

const isSupported = (): boolean =>
  typeof CSS !== 'undefined' && 'highlights' in CSS && typeof Highlight !== 'undefined';

export const isBlankRange = (range: Range): boolean => {
  try {
    return isEmptyOrWhitespace(range.toString());
  } catch {
    return false;
  }
};

type OwnedRanges = { blank: Map<ValidationSeverity, Range[]>; text: Map<ValidationSeverity, Range[]> };

const rangesByOwner = new Map<object, OwnedRanges>();

const syncRegistry = (): void => {
  for (const severity of SEVERITIES) {
    for (const [bucket, names] of [
      ['text', VALIDATION_HIGHLIGHT_NAMES],
      ['blank', VALIDATION_BLANK_HIGHLIGHT_NAMES],
    ] as const) {
      const ranges = [...rangesByOwner.values()].flatMap((owned) => owned[bucket].get(severity) ?? []);
      const name = names[severity];
      if (ranges.length === 0) {
        CSS.highlights.delete(name);
        continue;
      }
      const highlight = new Highlight(...ranges);
      highlight.priority = HIGHLIGHT_PRIORITY[severity];
      CSS.highlights.set(name, highlight);
    }
  }
};

export const applyValidationHighlights = (owner: object, validationsMap: ValidationsMap | undefined): void => {
  if (!isSupported()) return;

  const owned: OwnedRanges = { blank: new Map(), text: new Map() };
  for (const [range, result] of validationsMap ?? []) {
    if (result.scope !== 'inline') continue;
    ensureHighlightStyles(range);
    const bucket = isBlankRange(range) ? owned.blank : owned.text;
    const ranges = bucket.get(result.severity) ?? [];
    ranges.push(range);
    bucket.set(result.severity, ranges);
  }

  if (owned.blank.size === 0 && owned.text.size === 0) {
    rangesByOwner.delete(owner);
  } else {
    rangesByOwner.set(owner, owned);
  }
  syncRegistry();
};

export const clearValidationHighlights = (owner: object): void => {
  if (!isSupported()) return;
  if (!rangesByOwner.delete(owner)) return;
  syncRegistry();
};

export const applyHoverHighlight = (severity: ValidationSeverity, range: Range): void => {
  if (!isSupported()) return;
  if (isBlankRange(range)) return;
  ensureHighlightStyles(range);
  clearHoverHighlight();
  const highlight = new Highlight(range);
  highlight.priority = HIGHLIGHT_PRIORITY[severity] + HOVER_PRIORITY_OFFSET;
  CSS.highlights.set(VALIDATION_HOVER_HIGHLIGHT_NAMES[severity], highlight);
};

export const clearHoverHighlight = (): void => {
  if (!isSupported()) return;
  for (const name of Object.values(VALIDATION_HOVER_HIGHLIGHT_NAMES)) {
    CSS.highlights.delete(name);
  }
};
