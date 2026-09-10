import { coreValidationRules } from '@nl-design-system-community/clippy-a11y-validator';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { EditorSettings } from '@/types/settings';
import type { ViolationsMap } from '@/types/validation';
import { CustomEvents } from '@/events';
import { activeValidations, runValidation } from './index';

const settings = (overrides: Partial<EditorSettings> = {}): EditorSettings => ({
  enableRules: ['*'],
  topHeadingLevel: 1,
  ...overrides,
});

let dom: HTMLElement;

const validate = (markup: string, editorSettings = settings()): ViolationsMap => {
  dom.innerHTML = markup;
  let violations: ViolationsMap = new Map();
  runValidation(dom, editorSettings, (reported) => {
    violations = reported;
  });
  return violations;
};

const rulesIn = (map: ViolationsMap): string[] => [...map.values()].map(({ rule }) => rule);

beforeEach(() => {
  document.documentElement.lang = 'nl';
  dom = document.createElement('div');
  document.body.replaceChildren(dom);
});

describe('activeValidations', () => {
  it('enables every core validation on the wildcard', () => {
    expect(activeValidations(settings({ enableRules: ['*'] })).length).toBe(Object.keys(coreValidationRules).length);
  });

  it('disables everything on a disable wildcard, whatever is enabled', () => {
    expect(activeValidations(settings({ disableRules: ['*'], enableRules: ['*'] }))).toEqual([]);
  });

  it('enables only the rules that are listed', () => {
    const active = activeValidations(settings({ enableRules: ['PARAGRAPH_SHOULD_NOT_BE_EMPTY'] }));

    expect(active.map(({ rule }) => rule)).toEqual(['PARAGRAPH_SHOULD_NOT_BE_EMPTY']);
  });

  it('accepts rule identifiers in kebab-case, as the enable-rules attribute uses them', () => {
    const active = activeValidations(settings({ enableRules: ['paragraph-should-not-be-empty'] }));

    expect(active.map(({ rule }) => rule)).toEqual(['PARAGRAPH_SHOULD_NOT_BE_EMPTY']);
  });

  it('lets a disabled rule win over an enabled one', () => {
    const active = activeValidations(
      settings({
        disableRules: ['paragraph-should-not-be-empty'],
        enableRules: ['paragraph-should-not-be-empty', 'heading-must-not-be-empty'],
      }),
    );

    expect(active.map(({ rule }) => rule)).toEqual(['HEADING_MUST_NOT_BE_EMPTY']);
  });
});

describe('runValidation', () => {
  it('reports the violations of the validator package', () => {
    const map = validate('<h1>Titel</h1><p></p>');

    expect(rulesIn(map)).toContain(coreValidationRules.PARAGRAPH_SHOULD_NOT_BE_EMPTY);
  });

  it('keys every result by a range that selects the offending element', () => {
    const map = validate('<h1>Titel</h1><p></p>');
    const [range, result] = [...map.entries()][0]!;

    expect(range.startContainer).toBe(dom);
    expect(result.range).toBe(range);
    expect(result.element.tagName).toBe('P');
  });

  it('resolves the messages in the language of the document', () => {
    document.documentElement.lang = 'en';
    const map = validate('<h1>Titel</h1><p></p>');

    expect([...map.values()][0]?.messages.error).toBe('This paragraph is empty.');
  });

  it('honours the top heading level of the settings', () => {
    const map = validate('<h1>Titel</h1><p>tekst</p>', settings({ topHeadingLevel: 2 }));

    expect(rulesIn(map)).toContain(coreValidationRules.HEADING_MUST_NOT_BE_ABOVE_TOP_LEVEL);
  });

  it('validates nothing when every rule is disabled', () => {
    expect(validate('<p></p>', settings({ disableRules: ['*'] })).size).toBe(0);
  });

  it('applies the correction of the validator package', () => {
    const map = validate('<h1>Titel</h1><p></p>');
    [...map.values()].find(({ rule }) => rule === coreValidationRules.PARAGRAPH_SHOULD_NOT_BE_EMPTY)?.correct?.();

    expect(dom.innerHTML).toBe('<h1>Titel</h1>');
  });

  it('opens the image dialog instead of editing the DOM for a missing alt text', () => {
    const opened = vi.fn();
    globalThis.addEventListener(CustomEvents.OPEN_IMAGE_DIALOG, opened);

    const map = validate('<h1>Titel</h1><p><img src="paspoort.png" alt=""></p>');
    const result = [...map.values()].find(({ rule }) => rule === coreValidationRules.IMAGE_MUST_HAVE_ALT_TEXT);
    result?.correct?.();

    globalThis.removeEventListener(CustomEvents.OPEN_IMAGE_DIALOG, opened);

    expect(result?.customCorrectLabel).toBeTruthy();
    expect(opened).toHaveBeenCalledOnce();
    expect(dom.querySelector('img')).not.toBeNull();
  });

  it('selects an empty table cell rather than removing it', () => {
    const map = validate('<h1>Titel</h1><table><tr><th>Kop</th></tr><tr><td></td></tr></table>');
    const result = [...map.values()].find(({ rule }) => rule === coreValidationRules.TABLE_CELL_SHOULD_NOT_BE_EMPTY);
    result?.correct?.();

    expect(dom.querySelector('td')).not.toBeNull();
    expect(globalThis.getSelection()?.rangeCount).toBe(1);
  });
});
