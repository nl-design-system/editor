import { coreValidationRules, type ViolationCorrection } from '@nl-design-system-community/clippy-a11y-validator';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CustomEvents } from '@/events';
import { getElementRange } from '@/utils/ranges';
import { editorCorrections } from './corrections';

let root: HTMLElement;

const rangeOf = (markup: string, selector: string): { element: HTMLElement; range: Range | undefined } => {
  root.innerHTML = markup;
  const element = root.querySelector<HTMLElement>(selector)!;
  return { element, range: getElementRange(element) };
};

beforeEach(() => {
  root = document.createElement('div');
  document.body.replaceChildren(root);
  globalThis.getSelection()?.removeAllRanges();
});

describe('editorCorrections', () => {
  /**
   * Only the rules whose fix is a real editor interaction. A rule whose only remedy is "go there
   * and write something" gets no correction: the Focus action already takes the author there.
   */
  it('covers only the rules the editor can actually fix', () => {
    expect(Object.keys(editorCorrections)).toEqual([coreValidationRules.IMAGE_MUST_HAVE_ALT_TEXT]);
  });

  it('carries the current src and alt into the image dialog', () => {
    const opened = vi.fn();
    globalThis.addEventListener(CustomEvents.OPEN_IMAGE_DIALOG, opened);

    const { element, range } = rangeOf('<img src="paspoort.png" alt="">', 'img');
    editorCorrections[coreValidationRules.IMAGE_MUST_HAVE_ALT_TEXT]!(element, range).execute!();

    globalThis.removeEventListener(CustomEvents.OPEN_IMAGE_DIALOG, opened);

    const { detail } = opened.mock.calls[0]![0] as CustomEvent;
    expect(detail.replace).toBe(true);
    expect(detail.files[0].url).toContain('paspoort.png');
  });

  it('labels the alt-text action as an edit rather than a correction', () => {
    const { element, range } = rangeOf('<img src="paspoort.png" alt="">', 'img');

    expect(editorCorrections[coreValidationRules.IMAGE_MUST_HAVE_ALT_TEXT]!(element, range).label).toBeTruthy();
  });

  it('moves focus to the contenteditable host and selects the image', () => {
    root.setAttribute('contenteditable', 'true');
    const { element, range } = rangeOf('<p><img src="paspoort.png" alt=""></p>', 'img');

    editorCorrections[coreValidationRules.IMAGE_MUST_HAVE_ALT_TEXT]!(element, range).execute!();

    expect(document.activeElement).toBe(root);
    expect(globalThis.getSelection()?.getRangeAt(0)).toEqual(range);
  });

  it('falls back to the nearest focusable ancestor outside a contenteditable', () => {
    root.setAttribute('tabindex', '-1');
    const { element, range } = rangeOf('<p><img src="paspoort.png" alt=""></p>', 'img');

    editorCorrections[coreValidationRules.IMAGE_MUST_HAVE_ALT_TEXT]!(element, range).execute!();

    expect(document.activeElement).toBe(root);
  });

  it('leaves the selection alone when the violation has no range', () => {
    const { element } = rangeOf('<p><img src="paspoort.png" alt=""></p>', 'img');

    editorCorrections[coreValidationRules.IMAGE_MUST_HAVE_ALT_TEXT]!(element, undefined).execute!();

    expect(globalThis.getSelection()?.rangeCount).toBe(0);
  });
});

/**
 * Layering is a plain spread in `toEditorViolation`, so these pin the contract that spread relies
 * on: whatever the editor fills in wins, an omitted field defers, and nothing renders a button
 * without a fix behind it.
 */
describe('layering an editor correction over a reported one', () => {
  const reportedExecute = () => {};
  const overrideExecute = () => {};
  const layer = (reported?: Partial<ViolationCorrection>, override?: Partial<ViolationCorrection>) => ({
    ...reported,
    ...override,
  });

  it('has nothing to run when neither side offers a fix', () => {
    expect(layer().execute).toBeUndefined();
  });

  it('passes a reported fix through untouched', () => {
    expect(layer({ execute: reportedExecute }).execute).toBe(reportedExecute);
  });

  it('keeps the reported label when the editor only replaces the fix', () => {
    expect(layer({ execute: reportedExecute, label: 'Herstel' }, { execute: overrideExecute })).toEqual({
      execute: overrideExecute,
      label: 'Herstel',
    });
  });

  it('keeps the reported fix when the editor only renames the button', () => {
    const merged = layer({ execute: reportedExecute, label: 'Herstel' }, { label: 'Bewerken' });

    expect(merged.execute).toBe(reportedExecute);
    expect(merged.label).toBe('Bewerken');
  });

  it('uses the editor correction when nothing was reported', () => {
    expect(layer(undefined, { execute: overrideExecute, label: 'Bewerken' })).toEqual({
      execute: overrideExecute,
      label: 'Bewerken',
    });
  });

  /** A label names an action, so without one to run there is nothing to put a button on. */
  it('has nothing to run for a label with no fix behind it', () => {
    expect(layer(undefined, { label: 'Bewerken' }).execute).toBeUndefined();
  });

  it('leaves the label out when neither side names one', () => {
    expect(layer({ execute: reportedExecute })).not.toHaveProperty('label');
  });
});

describe('the editor correction registry', () => {
  const resolved = () => {
    const { element, range } = rangeOf('<img src="paspoort.png" alt="">', 'img');
    return Object.entries(editorCorrections).map(([rule, correction]) => [rule, correction!(element, range)] as const);
  };

  it('gives every entry something to execute or something to say', () => {
    const empty = resolved().filter(([, correction]) => !correction.execute && !correction.label);

    expect(empty).toEqual([]);
  });

  /**
   * Layering is a spread, so a key set to `undefined` would wipe what the validator reported
   * rather than defer to it. Absent and `undefined` are not interchangeable here.
   */
  it('omits the fields it does not fill in rather than setting them undefined', () => {
    const withUndefined = resolved().filter(([, correction]) =>
      Object.values(correction).some((value) => value === undefined),
    );

    expect(withUndefined).toEqual([]);
  });
});
