import {
  coreValidationRules,
  coreValidations,
  defineValidation,
  validationSeverity,
} from '@nl-design-system-community/clippy-a11y-validator';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { EditorSettings } from '@/types/settings';
import type { ViolationsMap } from '@/types/validation';
import { CustomEvents } from '@/events';
import { activeValidations, runValidation } from './index';

const settings = (overrides: Partial<EditorSettings> = {}): EditorSettings => ({
  enableRules: ['*'],
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

/**
 * A rule with copy in both locales, so the locale the editor derives from the document is visible
 * in the resolved message. No shipped validation carries English copy, hence a fixture of its own.
 */
const paragraphMustNotBeEmpty = defineValidation({
  condition: () => false,
  messages: {
    en: { error: 'This paragraph is empty.' },
    nl: { error: 'Deze alinea is leeg.' },
  },
  rule: 'PARAGRAPH_MUST_NOT_BE_EMPTY',
  scope: 'element',
  selector: 'p',
  severity: validationSeverity.WARNING,
});

/** A rule no core validation covers, to prove a host can bring its own. */
const paragraphMustNotShout = defineValidation({
  condition: (paragraph) => {
    const text = paragraph.textContent ?? '';
    // An empty paragraph is trivially uppercase; that is the core set's business, not this rule's.
    return text.trim() === '' || text !== text.toUpperCase();
  },
  messages: { nl: { error: 'Deze alinea staat volledig in hoofdletters.' } },
  rule: 'PARAGRAPH_MUST_NOT_SHOUT',
  scope: 'element',
  selector: 'p',
  severity: validationSeverity.WARNING,
});

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

  it('takes the validations it is given instead of the core set', () => {
    const active = activeValidations(settings({ validations: [paragraphMustNotShout] }));

    expect(active).toEqual([paragraphMustNotShout]);
  });

  it('still filters a supplied set by the rule keys', () => {
    const active = activeValidations(
      settings({
        disableRules: ['paragraph-must-not-shout'],
        validations: [paragraphMustNotShout, coreValidations.PARAGRAPH_SHOULD_NOT_BE_EMPTY],
      }),
    );

    expect(active.map(({ rule }) => rule)).toEqual(['PARAGRAPH_SHOULD_NOT_BE_EMPTY']);
  });

  it('disables a supplied set on the disable wildcard too', () => {
    expect(activeValidations(settings({ disableRules: ['*'], validations: [paragraphMustNotShout] }))).toEqual([]);
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

  it('accepts a document that opens at heading level 1', () => {
    const map = validate('<h1>Titel</h1><p>tekst</p>');

    expect(rulesIn(map)).not.toContain(coreValidationRules.HEADING_MUST_START_AT_LEVEL_ONE);
  });

  it('validates nothing when every rule is disabled', () => {
    expect(validate('<p></p>', settings({ disableRules: ['*'] })).size).toBe(0);
  });

  it('reports a validation the host brought itself', () => {
    const map = validate('<h1>Titel</h1><p>LET OP</p>', settings({ validations: [paragraphMustNotShout] }));
    const [violation] = [...map.values()];

    expect(rulesIn(map)).toEqual(['PARAGRAPH_MUST_NOT_SHOUT']);
    expect(violation?.messages.error).toBe('Deze alinea staat volledig in hoofdletters.');
    expect(violation?.range).toBeInstanceOf(Range);
  });

  it('resolves the messages in the language of the document', () => {
    document.documentElement.lang = 'en';
    const map = validate('<p></p>', settings({ validations: [paragraphMustNotBeEmpty] }));

    expect([...map.values()][0]?.messages.error).toBe('This paragraph is empty.');
  });

  it('runs only the given validations, not the core set as well', () => {
    // The empty paragraph would trip PARAGRAPH_SHOULD_NOT_BE_EMPTY if the core set were included.
    const map = validate('<h1>Titel</h1><p></p>', settings({ validations: [paragraphMustNotShout] }));

    expect(map.size).toBe(0);
  });

  it('applies the correction of the validator package', () => {
    const map = validate('<h1>Titel</h1><p><b></b></p>');
    [...map.values()]
      .find(({ rule }) => rule === coreValidationRules.PARAGRAPH_SHOULD_NOT_CONTAIN_EMPTY_FORMATTING)
      ?.correct?.();

    expect(dom.innerHTML).toBe('<h1>Titel</h1><p></p>');
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
