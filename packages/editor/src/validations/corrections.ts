import { msg } from '@lit/localize';
import {
  coreValidationRules,
  type CoreValidationRule,
  type Violation as CoreViolation,
  type ViolationCorrection,
} from '@nl-design-system-community/clippy-a11y-validator';
import { CustomEvents } from '@/events';

/**
 * What the editor layers over the correction the validator package reports, for one violation.
 *
 * A function rather than an object because both halves are deliberately late: the fix needs the
 * element and the range, which exist only per violation, and `msg()` has to run once the locale is
 * loaded. It returns the reported shape, so the two can simply be spread over each other.
 *
 * Whatever it fills in wins; omit a field to keep what the validator reported. Omit it — do not
 * set it to `undefined`, which in a spread would wipe the reported value instead of deferring.
 *
 * The validator deliberately ships no `correction` for the rule below, because the fix is not a
 * DOM edit but an editor interaction. Rules whose only remedy is "go there and write something"
 * get no correction at all: the Focus action already takes the author to the spot.
 */
type EditorCorrection = (element: HTMLElement, range: Range | undefined) => Partial<ViolationCorrection>;

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

export const editorCorrections: Partial<Record<CoreValidationRule, EditorCorrection>> = {
  // Alt text is written in the image dialog, which pre-fills the current src and alt.
  [coreValidationRules.IMAGE_MUST_HAVE_ALT_TEXT]: (element, range) => ({
    execute: () => {
      selectRange(range);
      const { alt, src } = element as HTMLImageElement;
      globalThis.dispatchEvent(
        new CustomEvent(CustomEvents.OPEN_IMAGE_DIALOG, {
          detail: { files: [{ name: alt, type: 'image/*', url: src }], replace: true },
        }),
      );
    },
    label: msg('Edit'),
  }),
};

/**
 * The editor's layer for this violation, in the reported shape so it can simply be spread over it.
 *
 * The cast is needed because a violation's `rule` is a plain string: a host can register its own
 * validations, so a lookup that finds nothing is normal.
 */
export const editorCorrection = (
  { element, rule }: CoreViolation,
  range: Range | undefined,
): Partial<ViolationCorrection> | undefined => editorCorrections[rule as CoreValidationRule]?.(element, range);
