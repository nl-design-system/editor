import { msg } from '@lit/localize';
import {
  coreValidationRules,
  type CoreValidationRule,
  type CorrectViolationFunction,
  type Violation as CoreViolation,
  type ViolationCorrection,
} from '@nl-design-system-community/clippy-a11y-validator';
import { CustomEvents } from '@/events';

/**
 * What the editor layers over the correction the validator package reports.
 *
 * Every field is optional and overrides its counterpart: a rule can replace the fix, rename the
 * button, or both. The validator deliberately ships no `correction` for the rules below, because
 * the fix is not a DOM edit but an editor interaction — opening a dialog, or placing the caret so
 * the author can type the answer.
 */
type EditorCorrection = {
  /** Replaces the reported fix. Omit to keep it and override only the label. */
  execute?: (element: HTMLElement, range: Range | undefined) => CorrectViolationFunction;
  /** Replaces the default "Correct" label, when the action is not a correction but an edit. */
  label?: () => string;
};

/**
 * Selects a range and makes sure keyboard focus follows it. Outside a TipTap editor (readonly or
 * standalone mode) the browser does not move focus to the contenteditable container by itself, so
 * we walk up to the nearest focusable ancestor.
 */
const selectRange = (range: Range | undefined): void => {
  if (!range) return;

  const startNode = range.startContainer;
  const startElement = startNode instanceof HTMLElement ? startNode : startNode.parentElement;
  const focusTarget =
    startElement?.closest<HTMLElement>('[contenteditable]') ??
    startElement?.closest<HTMLElement>('[tabindex]') ??
    startElement;
  focusTarget?.focus();

  const selection = globalThis.getSelection();
  if (!selection) return;
  selection.removeAllRanges();
  selection.addRange(range);
};

/** Places the caret in the element so the author can supply the missing text. */
const selectForAuthoring: EditorCorrection = {
  execute: (_element, range) => () => selectRange(range),
};

export const editorCorrections: Partial<Record<CoreValidationRule, EditorCorrection>> = {
  // Alt text is written in the image dialog, which pre-fills the current src and alt.
  [coreValidationRules.IMAGE_MUST_HAVE_ALT_TEXT]: {
    execute: (element, range) => () => {
      selectRange(range);
      const { alt, src } = element as HTMLImageElement;
      globalThis.dispatchEvent(
        new CustomEvent(CustomEvents.OPEN_IMAGE_DIALOG, {
          detail: { files: [{ name: alt, type: 'image/*', url: src }], replace: true },
        }),
      );
    },
    label: () => msg('Edit'),
  },
  // Only the author knows where the link goes, so select the text for them to rewrite.
  [coreValidationRules.LINK_SHOULD_NOT_BE_TOO_GENERIC]: selectForAuthoring,
  // Removing a caption or a cell would break the table, so place the caret instead.
  [coreValidationRules.TABLE_CAPTION_SHOULD_NOT_BE_EMPTY]: selectForAuthoring,
  [coreValidationRules.TABLE_CELL_SHOULD_NOT_BE_EMPTY]: selectForAuthoring,
};

/**
 * Layers an editor correction over the one the validator package reports: each field the editor
 * fills in wins, the rest is kept. Without anything to execute there is no correction at all, so a
 * label on its own never renders a button that does nothing.
 */
export const mergeCorrection = (
  reported: ViolationCorrection | undefined,
  override: EditorCorrection | undefined,
  element: HTMLElement,
  range: Range | undefined,
): ViolationCorrection | undefined => {
  const execute = override?.execute?.(element, range) ?? reported?.execute;
  if (!execute) return undefined;

  const label = override?.label?.() ?? reported?.label;
  return { execute, ...(label === undefined ? {} : { label }) };
};

/** The one place a reported correction and an editor correction become a single correction. */
export const resolveCorrection = (
  violation: CoreViolation,
  range: Range | undefined,
): ViolationCorrection | undefined =>
  mergeCorrection(
    violation.correction,
    editorCorrections[violation.rule as CoreValidationRule],
    violation.element,
    range,
  );
