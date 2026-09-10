import { msg } from '@lit/localize';
import { coreValidationRules, type CoreValidationRule } from '@nl-design-system-community/clippy-a11y-validator';
import type { CorrectValidationFunction } from '@/types/validation';
import { CustomEvents } from '@/events';

/**
 * A correction the editor performs itself, instead of the DOM edit the validator package offers.
 *
 * The validator deliberately ships no `correct` for these rules: the fix is not a DOM edit but an
 * editor interaction — opening a dialog, or placing the caret so the author can type the answer.
 */
type EditorCorrection = {
  /** Replaces the default "Correct" label, when the action is not a correction but an edit. */
  customCorrectLabel?: () => string;
  correct: (element: HTMLElement, range: Range | undefined) => CorrectValidationFunction;
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
  correct: (_element, range) => () => selectRange(range),
};

export const editorCorrections: Partial<Record<CoreValidationRule, EditorCorrection>> = {
  // Alt text is written in the image dialog, which pre-fills the current src and alt.
  [coreValidationRules.IMAGE_MUST_HAVE_ALT_TEXT]: {
    correct: (element, range) => () => {
      selectRange(range);
      const { alt, src } = element as HTMLImageElement;
      globalThis.dispatchEvent(
        new CustomEvent(CustomEvents.OPEN_IMAGE_DIALOG, {
          detail: { files: [{ name: alt, type: 'image/*', url: src }], replace: true },
        }),
      );
    },
    customCorrectLabel: () => msg('Edit'),
  },
  // Only the author knows where the link goes, so select the text for them to rewrite.
  [coreValidationRules.LINK_SHOULD_NOT_BE_TOO_GENERIC]: selectForAuthoring,
  // Removing a caption or a cell would break the table, so place the caret instead.
  [coreValidationRules.TABLE_CAPTION_SHOULD_NOT_BE_EMPTY]: selectForAuthoring,
  [coreValidationRules.TABLE_CELL_SHOULD_NOT_BE_EMPTY]: selectForAuthoring,
};
