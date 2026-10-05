import { coreValidationRules } from '@nl-design-system-community/clippy-a11y-validator';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CustomEvents } from '@/events';
import { getElementRange } from '@/utils/ranges';
import { editorCorrections, mergeCorrection } from './corrections';

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
  it('covers exactly the rules the validator package leaves uncorrectable', () => {
    expect(Object.keys(editorCorrections).sort()).toEqual([
      coreValidationRules.IMAGE_MUST_HAVE_ALT_TEXT,
      coreValidationRules.LINK_SHOULD_NOT_BE_TOO_GENERIC,
      coreValidationRules.TABLE_CAPTION_SHOULD_NOT_BE_EMPTY,
      coreValidationRules.TABLE_CELL_SHOULD_NOT_BE_EMPTY,
    ]);
  });

  it('carries the current src and alt into the image dialog', () => {
    const opened = vi.fn();
    globalThis.addEventListener(CustomEvents.OPEN_IMAGE_DIALOG, opened);

    const { element, range } = rangeOf('<img src="paspoort.png" alt="">', 'img');
    editorCorrections[coreValidationRules.IMAGE_MUST_HAVE_ALT_TEXT]!.execute!(element, range)();

    globalThis.removeEventListener(CustomEvents.OPEN_IMAGE_DIALOG, opened);

    const { detail } = opened.mock.calls[0]![0] as CustomEvent;
    expect(detail.replace).toBe(true);
    expect(detail.files[0].url).toContain('paspoort.png');
  });

  it('labels the alt-text action as an edit rather than a correction', () => {
    expect(editorCorrections[coreValidationRules.IMAGE_MUST_HAVE_ALT_TEXT]!.label?.()).toBeTruthy();
  });

  it('moves focus to the contenteditable host when selecting a generic link', () => {
    root.setAttribute('contenteditable', 'true');
    const { element, range } = rangeOf('<p><a href="#">lees meer</a></p>', 'a');

    editorCorrections[coreValidationRules.LINK_SHOULD_NOT_BE_TOO_GENERIC]!.execute!(element, range)();

    expect(document.activeElement).toBe(root);
    expect(globalThis.getSelection()?.getRangeAt(0)).toEqual(range);
  });

  it('falls back to the nearest focusable ancestor outside a contenteditable', () => {
    root.setAttribute('tabindex', '-1');
    const { element, range } = rangeOf('<table><caption></caption></table>', 'caption');

    editorCorrections[coreValidationRules.TABLE_CAPTION_SHOULD_NOT_BE_EMPTY]!.execute!(element, range)();

    expect(document.activeElement).toBe(root);
  });

  it('leaves the selection alone when the violation has no range', () => {
    const { element } = rangeOf('<table><tr><td></td></tr></table>', 'td');

    editorCorrections[coreValidationRules.TABLE_CELL_SHOULD_NOT_BE_EMPTY]!.execute!(element, undefined)();

    expect(globalThis.getSelection()?.rangeCount).toBe(0);
  });
});

describe('mergeCorrection', () => {
  const element = document.createElement('p');
  const reportedExecute = () => {};
  const overrideExecute = () => {};

  it('reports no correction when neither side offers one', () => {
    expect(mergeCorrection(undefined, undefined, element, undefined)).toBeUndefined();
  });

  it('passes a reported correction through untouched', () => {
    const reported = { execute: reportedExecute };

    expect(mergeCorrection(reported, undefined, element, undefined)?.execute).toBe(reportedExecute);
  });

  it('keeps the reported label when the editor only replaces the fix', () => {
    const merged = mergeCorrection(
      { execute: reportedExecute, label: 'Herstel' },
      { execute: () => overrideExecute },
      element,
      undefined,
    );

    expect(merged).toEqual({ execute: overrideExecute, label: 'Herstel' });
  });

  it('keeps the reported fix when the editor only renames the button', () => {
    const merged = mergeCorrection(
      { execute: reportedExecute, label: 'Herstel' },
      { label: () => 'Bewerken' },
      element,
      undefined,
    );

    expect(merged?.execute).toBe(reportedExecute);
    expect(merged?.label).toBe('Bewerken');
  });

  it('uses the editor correction when nothing was reported', () => {
    const merged = mergeCorrection(
      undefined,
      { execute: () => overrideExecute, label: () => 'Bewerken' },
      element,
      undefined,
    );

    expect(merged).toEqual({ execute: overrideExecute, label: 'Bewerken' });
  });

  /** A label names an action, so without one to run there is nothing to put a button on. */
  it('reports no correction for a label with nothing to execute', () => {
    expect(mergeCorrection(undefined, { label: () => 'Bewerken' }, element, undefined)).toBeUndefined();
  });

  it('leaves the label out when neither side names one', () => {
    expect(mergeCorrection({ execute: reportedExecute }, undefined, element, undefined)).not.toHaveProperty('label');
  });
});

describe('the editor correction registry', () => {
  it('gives every entry something to execute or something to say', () => {
    const empty = Object.entries(editorCorrections).filter(
      ([, correction]) => !correction?.execute && !correction?.label,
    );

    expect(empty).toEqual([]);
  });
});
