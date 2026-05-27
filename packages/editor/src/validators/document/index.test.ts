import { vi, describe, it, expect } from 'vitest';
import type { ValidationResult } from '../../types/validation.ts';
import { createTestEditor } from '../../../test/createTestEditor';
import {
  documentMustHaveCorrectHeadingOrder,
  documentMustHaveSingleHeadingOne,
  documentMustHaveTopLevelHeadingOne,
} from './index';

const byKey = (map: Map<Range, ValidationResult>, key: string): ValidationResult | undefined =>
  [...map.values()].find((v) => v.validatorKey === key);

describe('Document validations', () => {
  describe('documentMustHaveCorrectHeadingOrder', () => {
    it('returns the ValidationMap after Editor.onCreated', async () => {
      const callback = vi.fn();

      await createTestEditor(
        `
        <h1>Title</h1>
        <h3>Subtitle</h3>
        <p>Text</p>
      `,
        callback,
      );
      await vi.waitFor(() => {
        expect(callback).toHaveBeenCalledTimes(1);
      });
      const mapArg = callback.mock.calls[0][0];
      expect(mapArg).toBeInstanceOf(Map);
      expect(byKey(mapArg, 'document-must-have-correct-heading-order')).toBeDefined();
    });

    it('returns empty array for correct heading order', async () => {
      const editor = await createTestEditor(
        `
        <h1>Title</h1>
        <h2>Subtitle</h2>
        <p>Text</p>
      `,
      );

      const result = documentMustHaveCorrectHeadingOrder(editor.view.dom);
      expect(result).toStrictEqual([]);
    });

    it('returns warning for skipped heading level', async () => {
      const editor = await createTestEditor(`
        <h1>Title</h1>
        <h3>Subtitle</h3>
      `);

      const result = documentMustHaveCorrectHeadingOrder(editor.view.dom);
      expect(result).toEqual([
        {
          correct: expect.any(Function),
          range: expect.any(Object),
          scope: 'block',
          severity: 'warning',
          tipPayload: {
            headingLevel: 3,
            precedingHeadingLevel: 1,
            topHeadingLevel: 1,
          },
        },
      ]);
    });

    it('returns error when heading level is below topHeadingLevel', async () => {
      const settings = { disableRules: [], enableRules: ['*'], topHeadingLevel: 2 };
      const editor = await createTestEditor(
        `
      <h1>Title</h1>
      <h2>Subtitle</h2>
      <h4>Subtitle</h4>
    `,
        undefined,
        settings,
      );

      const result = documentMustHaveCorrectHeadingOrder(editor.view.dom, settings);
      expect(result).toEqual([
        {
          correct: expect.any(Function),
          range: expect.any(Object),
          scope: 'block',
          severity: 'error',
          tipPayload: {
            headingLevel: 1,
            precedingHeadingLevel: 2,
            topHeadingLevel: 2,
          },
        },
        {
          correct: expect.any(Function),
          range: expect.any(Object),
          scope: 'block',
          severity: 'warning',
          tipPayload: {
            headingLevel: 4,
            precedingHeadingLevel: 2,
            topHeadingLevel: 2,
          },
        },
      ]);
    });
  });

  describe('documentMustHaveSingleHeadingOne', () => {
    it('returns empty array when document has exactly one h1', async () => {
      const editor = await createTestEditor(`<h1>Title</h1><h2>Subtitle</h2><p>Text</p>`);
      expect(documentMustHaveSingleHeadingOne(editor.view.dom)).toStrictEqual([]);
    });

    it('returns empty array when document has no h1', async () => {
      const editor = await createTestEditor(`<h2>Subtitle</h2><p>Text</p>`);
      expect(documentMustHaveSingleHeadingOne(editor.view.dom)).toStrictEqual([]);
    });

    it('returns error for each duplicate h1', async () => {
      const editor = await createTestEditor(`<h1>First</h1><p>Text</p><h1>Second</h1><h1>Third</h1>`);
      const results = documentMustHaveSingleHeadingOne(editor.view.dom);
      expect(results).toHaveLength(2);
      results.forEach((r) => expect(r.severity).toBe('error'));
    });

    it('is reported via the validation callback', async () => {
      const callback = vi.fn();
      await createTestEditor(
        `
        <h1>test</h1>
        <p>paragraaf tekst</p>
        <h1>test</h1>
        <p>Nog een paragraaf tekst</p>
    `,
        callback,
      );
      await vi.waitFor(() => {
        expect(callback).toHaveBeenCalledTimes(1);
      });
      expect(byKey(callback.mock.calls[0][0], 'document-must-have-single-heading-one')?.severity).toBe('error');
    });
  });

  describe('documentMustHaveTopLevelHeadingOne', () => {
    it('returns empty array when document starts with h1', async () => {
      const editor = await createTestEditor(`<h1>Title</h1><p>Text</p>`);
      expect(documentMustHaveTopLevelHeadingOne(editor.view.dom)).toStrictEqual([]);
    });

    it('returns info result when document does not start with h1', async () => {
      const editor = await createTestEditor(`<h2>Subtitle</h2><p>Text</p>`);
      const results = documentMustHaveTopLevelHeadingOne(editor.view.dom);
      expect(results).toHaveLength(1);
      expect(results[0].severity).toBe('info');
    });

    it('returns empty array when topHeadingLevel is not 1', async () => {
      const settings = { disableRules: [], enableRules: ['*'], topHeadingLevel: 2 };
      const editor = await createTestEditor(`<h2>Title</h2>`, undefined, settings);
      expect(documentMustHaveTopLevelHeadingOne(editor.view.dom, settings)).toStrictEqual([]);
    });

    it('is reported via the validation callback', async () => {
      const callback = vi.fn();
      await createTestEditor(
        `
      <h2>Title</h2>
      <p>Text</p>
    `,
        callback,
      );
      await vi.waitFor(() => {
        expect(callback).toHaveBeenCalledTimes(1);
      });
      const mapArg = callback.mock.calls[0][0];
      expect(mapArg).toBeInstanceOf(Map);
      expect(byKey(mapArg, 'document-must-have-top-level-heading')).toEqual({
        correct: expect.any(Function),
        range: expect.any(Object),
        scope: 'block',
        severity: 'info',
        validatorKey: 'document-must-have-top-level-heading',
      });
    });
  });
});
