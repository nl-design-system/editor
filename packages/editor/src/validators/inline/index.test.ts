import { createTestEditor } from '@test/createTestEditor';
import { describe, expect, it, vi } from 'vitest';
import type { ValidationResult } from '@/types/validation';
import { inlineValidations } from '@/constants';

const byKey = (map: Map<Range, ValidationResult>, key: string): ValidationResult | undefined =>
  [...map.values()].find((v) => v.validatorKey === key);

const allByKey = (map: Map<Range, ValidationResult>, key: string): ValidationResult[] =>
  [...map.values()].filter((v) => v.validatorKey === key);

describe('Inline validations', () => {
  describe('Empty elements', () => {
    describe.each([
      { html: '<b>&nbsp;</b>', nodeType: 'bold' },
      { html: '<strong>&nbsp;</strong>', nodeType: 'bold' },
      { html: '<i>&nbsp;</i>', nodeType: 'italic' },
      { html: '<em>&nbsp;</em>', nodeType: 'italic' },
      { html: '<s>&nbsp;</s>', nodeType: 'strike' },
      { html: '<strike>&nbsp;</strike>', nodeType: 'strike' },
      { html: '<del>&nbsp;</del>', nodeType: 'strike' },
      { html: '<u>&nbsp;</u>', nodeType: 'underline' },
      { html: '<mark>&nbsp;</mark>', nodeType: 'highlight' },
      { html: '<a href="https://example.com">&nbsp;</a>', nodeType: 'link' },
      { html: '<code>&nbsp;</code>', nodeType: 'code' },
    ])('should detect empty $nodeType with non-breaking space', ({ html, nodeType }) => {
      it(`validates ${nodeType} is empty`, async () => {
        const callback = vi.fn();
        await createTestEditor(`<h1>Title</h1><p>Text with ${html} here</p>`, callback);

        await vi.waitFor(() => {
          expect(callback).toHaveBeenCalledTimes(1);
        });

        const validationMap = callback.mock.calls[0][0];
        expect(validationMap).toBeInstanceOf(Map);

        const validation = byKey(validationMap, inlineValidations.INLINE_SHOULD_NOT_BE_EMPTY);

        expect(validation).toBeDefined();
        expect(validation!.severity).toBe('info');
        expect(validation!.tipPayload!['nodeType']).toBe(nodeType);
      });
    });

    it.each([
      { description: 'bold element with text', html: '<b>text</b>' },
      { description: 'strong element with text', html: '<strong>text</strong>' },
      { description: 'italic element with text', html: '<i>text</i>' },
      { description: 'emphasis element with text', html: '<em>text</em>' },
      { description: 'strikethrough element with text', html: '<s>text</s>' },
      { description: 'del element with text', html: '<del>text</del>' },
      { description: 'underline element with text', html: '<u>text</u>' },
      { description: 'mark element with text', html: '<mark>text</mark>' },
      { description: 'link with text', html: '<a href="https://example.com">Link text</a>' },
      { description: 'code element with text', html: '<code>code text</code>' },
    ])('should not flag non-empty $description', async ({ html }) => {
      const callback = vi.fn();
      await createTestEditor(`<h1>Title</h1><p>Text with ${html} here</p>`, callback);

      await vi.waitFor(() => {
        expect(callback).toHaveBeenCalled();
      });

      const validationMap = callback.mock.calls[0][0];
      expect(byKey(validationMap, inlineValidations.INLINE_SHOULD_NOT_BE_EMPTY)).toBeUndefined();
    });

    it('should detect multiple empty elements in the same document', async () => {
      const callback = vi.fn();
      await createTestEditor(
        `<h1>Title</h1>
          <p>Empty bold: <b>&nbsp;</b></p>
          <p>Empty italic: <i>&nbsp;</i></p>
          <p>Empty link: <a href="#">&nbsp;</a></p>
          <p>Empty strike: <s>&nbsp;</s></p>
          <p>Valid bold: <b>text</b></p>`,
        callback,
      );

      await vi.waitFor(() => {
        expect(callback).toHaveBeenCalledTimes(1);
      });

      const validationMap = callback.mock.calls[0][0];
      const emptyInlineErrors = allByKey(validationMap, inlineValidations.INLINE_SHOULD_NOT_BE_EMPTY);
      expect(emptyInlineErrors).toHaveLength(4);
    });

    it('should detect empty elements even when nested', async () => {
      const callback = vi.fn();
      await createTestEditor(`<h1>Title</h1><p>Nested: <b><i>&nbsp;</i></b></p>`, callback);

      await vi.waitFor(() => {
        expect(callback).toHaveBeenCalledTimes(1);
      });

      const validationMap = callback.mock.calls[0][0];
      const emptyInlineErrors = allByKey(validationMap, inlineValidations.INLINE_SHOULD_NOT_BE_EMPTY);
      expect(emptyInlineErrors.length).toBeGreaterThan(0);
    });
  });

  describe('Links', () => {
    it('should notify editor of empty link', async () => {
      const callback = vi.fn();
      await createTestEditor(
        `
    <h1>foo</h1><p>test with an empty<a href="https://example.com"> </a>link</p>`,
        callback,
      );

      await vi.waitFor(() => {
        expect(callback).toHaveBeenCalledTimes(1);
      });
      const mapArg = callback.mock.calls[0][0];
      expect(mapArg).toBeInstanceOf(Map);
      expect(byKey(mapArg, inlineValidations.INLINE_SHOULD_NOT_BE_EMPTY)?.tipPayload?.['nodeType']).toBe('link');
    });

    it('should notify of empty link or generic link', async () => {
      const callback = vi.fn();
      await createTestEditor(
        `
    <h1>foo</h1><p>Een lege link<a href="https://example.com"> </a></p><p>test with an underlined text. <a href="https://example.com">Klik hier</a></p>`,
        callback,
      );

      await vi.waitFor(() => {
        expect(callback).toHaveBeenCalledTimes(1);
      });

      const genericLinkEntry = byKey(callback.mock.calls[0][0], inlineValidations.LINK_SHOULD_NOT_BE_TOO_GENERIC);
      expect(genericLinkEntry).toBeDefined();
      expect(genericLinkEntry?.severity).toBe('info');
    });
  });

  describe('Text formatting', () => {
    it('should notify editor of usage of underlined', async () => {
      const callback = vi.fn();
      await createTestEditor(
        `
    <h1>foo</h1><p>test with an <u>underlined text</u></p>`,
        callback,
      );

      await vi.waitFor(() => {
        expect(callback).toHaveBeenCalledTimes(1);
      });
      expect(byKey(callback.mock.calls[0][0], inlineValidations.INLINE_SHOULD_NOT_BE_UNDERLINED)?.severity).toBe(
        'info',
      );
    });
  });
});
