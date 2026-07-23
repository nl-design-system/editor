import type { Editor } from '@tiptap/core';
import { createTestEditor } from '@test/createTestEditor';
import { describe, expect, it, vi } from 'vitest';
import type { EditorSettings } from '@/types/settings';
import type { ValidationResult } from '@/types/validation';
import { blockValidations, documentValidations, inlineValidations } from '@/constants';
import { CustomEvents } from '@/events';

type ResultMap = Map<Range, ValidationResult>;

const byKey = (map: ResultMap, key: string): ValidationResult | undefined =>
  [...map.values()].find((v) => v.validatorKey === key);

const allByKey = (map: ResultMap, key: string): ValidationResult[] =>
  [...map.values()].filter((v) => v.validatorKey === key);

/** Runs the validation extension against `html` and resolves with the produced result map. */
const validate = async (html: string, settings?: EditorSettings): Promise<{ editor: Editor; map: ResultMap }> => {
  const callback = vi.fn();
  const editor = await createTestEditor(html, callback, settings);
  await vi.waitFor(() => expect(callback).toHaveBeenCalled());
  return { editor, map: callback.mock.calls.at(-1)![0] as ResultMap };
};

describe('runValidation adapter', () => {
  it('adapts detection results into a Range-keyed map', async () => {
    const { map } = await validate('<h1></h1>');
    expect(map).toBeInstanceOf(Map);
    const entry = byKey(map, blockValidations.HEADING_MUST_NOT_BE_EMPTY);
    expect(entry).toBeDefined();
    expect(entry!.range).toBeInstanceOf(Range);
    expect(entry!.scope).toBe('block');
    expect(entry!.severity).toBe('error');
  });

  it('attaches a correct action for correctable block issues', async () => {
    const { map } = await validate('<h1></h1>');
    expect(typeof byKey(map, blockValidations.HEADING_MUST_NOT_BE_EMPTY)?.correct).toBe('function');
  });

  it('detects block, inline and document rules together', async () => {
    const { map } = await validate(
      `<h1>Title</h1><h3>Skipped</h3><p>text <u>underlined</u></p><p><a href="https://example.com">Klik hier</a></p>`,
    );
    expect(byKey(map, documentValidations.DOCUMENT_MUST_HAVE_CORRECT_HEADING_ORDER)).toBeDefined();
    expect(byKey(map, inlineValidations.INLINE_SHOULD_NOT_BE_UNDERLINED)).toBeDefined();
    expect(byKey(map, inlineValidations.LINK_SHOULD_NOT_BE_TOO_GENERIC)).toBeDefined();
  });

  it('carries tipPayload through to the result', async () => {
    const { map } = await validate('<h1>Title</h1><p>Text with <b>&nbsp;</b> here</p>');
    expect(byKey(map, inlineValidations.INLINE_SHOULD_NOT_BE_EMPTY)?.tipPayload?.['nodeType']).toBe('bold');
  });

  it('reports every duplicate heading-one as its own entry', async () => {
    const { map } = await validate('<h1>One</h1><p>x</p><h1>Two</h1><h1>Three</h1>');
    expect(allByKey(map, documentValidations.DOCUMENT_MUST_HAVE_SINGLE_HEADING_ONE)).toHaveLength(2);
  });

  it('produces no entries for accessible content', async () => {
    const { map } = await validate('<h1>Title</h1><p>A perfectly fine paragraph.</p>');
    expect(map.size).toBe(0);
  });
});

describe('rule filtering through settings', () => {
  it('disableRules removes a rule from the results', async () => {
    const settings: EditorSettings = {
      disableRules: [blockValidations.HEADING_MUST_NOT_BE_EMPTY],
      enableRules: ['*'],
      topHeadingLevel: 1,
    };
    const { map } = await validate('<h1></h1>', settings);
    expect(byKey(map, blockValidations.HEADING_MUST_NOT_BE_EMPTY)).toBeUndefined();
  });

  it('enableRules limits detection to the named rules (kebab-case accepted)', async () => {
    const settings: EditorSettings = {
      disableRules: [],
      enableRules: ['heading-must-not-be-empty'],
      topHeadingLevel: 1,
    };
    const { map } = await validate('<h1></h1><p>text <u>u</u></p>', settings);
    expect(byKey(map, blockValidations.HEADING_MUST_NOT_BE_EMPTY)).toBeDefined();
    expect(byKey(map, inlineValidations.INLINE_SHOULD_NOT_BE_UNDERLINED)).toBeUndefined();
  });

  it('honours a non-default topHeadingLevel', async () => {
    const settings: EditorSettings = { disableRules: [], enableRules: ['*'], topHeadingLevel: 2 };
    const { map } = await validate('<h2>Title</h2><p>Text</p>', settings);
    expect(byKey(map, documentValidations.DOCUMENT_MUST_HAVE_TOP_LEVEL_HEADING_ONE)).toBeUndefined();
  });
});

describe('correct actions mutate the document', () => {
  it('removes an empty heading', async () => {
    const { editor, map } = await validate('<h1></h1><p>Body</p>');
    const entry = byKey(map, blockValidations.HEADING_MUST_NOT_BE_EMPTY)!;
    entry.correct!();
    expect(editor.view.dom.querySelector('h1')).toBeNull();
  });

  it('unwraps an underlined mark', async () => {
    const { editor, map } = await validate('<h1>Title</h1><p>text <u>underlined</u></p>');
    const entry = byKey(map, inlineValidations.INLINE_SHOULD_NOT_BE_UNDERLINED)!;
    entry.correct!();
    expect(editor.view.dom.querySelector('u')).toBeNull();
  });

  it('demotes a duplicate heading one to heading two', async () => {
    const { editor, map } = await validate('<h1>One</h1><p>x</p><h1>Two</h1>');
    const entry = byKey(map, documentValidations.DOCUMENT_MUST_HAVE_SINGLE_HEADING_ONE)!;
    entry.correct!();
    expect(editor.view.dom.querySelectorAll('h1')).toHaveLength(1);
    expect(editor.view.dom.querySelectorAll('h2').length).toBeGreaterThanOrEqual(1);
  });

  it('promotes a heading level to fix heading order', async () => {
    const { editor, map } = await validate('<h1>Title</h1><h3>Skipped</h3>');
    const entry = byKey(map, documentValidations.DOCUMENT_MUST_HAVE_CORRECT_HEADING_ORDER)!;
    entry.correct!();
    expect(editor.view.dom.querySelector('h3')).toBeNull();
    expect(editor.view.dom.querySelector('h2')).not.toBeNull();
  });

  it('opens the image dialog for a missing alt text', async () => {
    const { map } = await validate('<h1>Title</h1><p>Text</p><img src="cat.png">');
    const entry = byKey(map, blockValidations.IMAGE_MUST_HAVE_ALT_TEXT)!;
    const listener = vi.fn();
    globalThis.addEventListener(CustomEvents.OPEN_IMAGE_DIALOG, listener, { once: true });
    entry.correct!();
    expect(listener).toHaveBeenCalledOnce();
  });

  it('converts a list-like paragraph into a semantic list', async () => {
    const { editor, map } = await validate('<h1>Title</h1><p>- one<br>- two<br>- three</p>');
    const entry = byKey(map, blockValidations.PARAGRAPH_SHOULD_NOT_RESEMBLE_LIST)!;
    entry.correct!();
    expect(editor.view.dom.querySelector('ul')).not.toBeNull();
  });
});
