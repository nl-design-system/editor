import { coreValidationRules } from '@nl-design-system-community/clippy-a11y-validator';
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
    editorCorrections[coreValidationRules.IMAGE_MUST_HAVE_ALT_TEXT]!.correct(element, range)();

    globalThis.removeEventListener(CustomEvents.OPEN_IMAGE_DIALOG, opened);

    const { detail } = opened.mock.calls[0]![0] as CustomEvent;
    expect(detail.replace).toBe(true);
    expect(detail.files[0].url).toContain('paspoort.png');
  });

  it('labels the alt-text action as an edit rather than a correction', () => {
    expect(editorCorrections[coreValidationRules.IMAGE_MUST_HAVE_ALT_TEXT]!.customCorrectLabel?.()).toBeTruthy();
  });

  it('moves focus to the contenteditable host when selecting a generic link', () => {
    root.setAttribute('contenteditable', 'true');
    const { element, range } = rangeOf('<p><a href="#">lees meer</a></p>', 'a');

    editorCorrections[coreValidationRules.LINK_SHOULD_NOT_BE_TOO_GENERIC]!.correct(element, range)();

    expect(document.activeElement).toBe(root);
    expect(globalThis.getSelection()?.getRangeAt(0)).toEqual(range);
  });

  it('falls back to the nearest focusable ancestor outside a contenteditable', () => {
    root.setAttribute('tabindex', '-1');
    const { element, range } = rangeOf('<table><caption></caption></table>', 'caption');

    editorCorrections[coreValidationRules.TABLE_CAPTION_SHOULD_NOT_BE_EMPTY]!.correct(element, range)();

    expect(document.activeElement).toBe(root);
  });

  it('leaves the selection alone when the violation has no range', () => {
    const { element } = rangeOf('<table><tr><td></td></tr></table>', 'td');

    editorCorrections[coreValidationRules.TABLE_CELL_SHOULD_NOT_BE_EMPTY]!.correct(element, undefined)();

    expect(globalThis.getSelection()?.rangeCount).toBe(0);
  });
});
