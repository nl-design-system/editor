import { describe, expect, it, vi } from 'vitest';
import type { ValidationResult } from '../../types/validation.ts';
import { createTestEditor } from '../../../test/createTestEditor';
import { contentValidations } from '../../constants';

/** Find the first ValidationResult with the given validatorKey in the map. */
const byKey = (map: Map<Range, ValidationResult>, key: string): ValidationResult | undefined =>
  [...map.values()].find((v) => v.validatorKey === key);

/** Return all ValidationResults with the given validatorKey in the map. */
const allByKey = (map: Map<Range, ValidationResult>, key: string): ValidationResult[] =>
  [...map.values()].filter((v) => v.validatorKey === key);

describe('Content validations', () => {
  describe('Headings', () => {
    it('returns the ValidationMap after Editor.onCreated', async () => {
      const callback = vi.fn();

      await createTestEditor(
        `
      <h1></h1>
    `,
        callback,
      );
      await vi.waitFor(() => {
        expect(callback).toHaveBeenCalledTimes(1);
      });
      const mapArg = callback.mock.calls[0][0];
      expect(mapArg).toBeInstanceOf(Map);
      expect(byKey(mapArg, contentValidations.HEADING_MUST_NOT_BE_EMPTY)).toBeDefined();
    });
  });

  describe('Lists', () => {
    it('should find content that resembles a list', async () => {
      const callback = vi.fn();
      await createTestEditor(
        `
    <p>- tet<br>- test<br>- test</p>`,
        callback,
      );

      await vi.waitFor(() => {
        expect(callback).toHaveBeenCalledTimes(1);
      });
      const mapArg = callback.mock.calls[0][0];
      expect(mapArg).toBeInstanceOf(Map);
      expect(byKey(mapArg, 'document-must-have-semantic-lists')).toBeDefined();
    });
  });

  describe('Definition list validations', () => {
    it('should notify of incorrect definition list', async () => {
      const callback = vi.fn();
      await createTestEditor(
        `
    <h1>foo</h1><dl></dl><dl><dt>term only</dt></dl><dl><dd>description only</dd></dl>`,
        callback,
      );

      await vi.waitFor(() => {
        expect(callback).toHaveBeenCalledTimes(1);
      });
      expect(
        allByKey(callback.mock.calls[0][0], 'description-list-must-contain-term').some((v) => v.severity === 'error'),
      ).toBe(true);
      expect(byKey(callback.mock.calls[0][0], 'definition-description-must-follow-term')?.severity).toBe('error');
      expect(allByKey(callback.mock.calls[0][0], 'description-list-must-contain-term')).toHaveLength(2);
    });
  });

  describe('Table validations', () => {
    it('should notify editor of empty nodes th and td', async () => {
      const callback = vi.fn();
      await createTestEditor(
        `
    <h1>foo</h1><table><tr><th>test</th><th></th></tr><tr><td> </td></td></tr></table>`,
        callback,
      );

      await vi.waitFor(() => {
        expect(callback).toHaveBeenCalledTimes(1);
      });
      const mapArg = callback.mock.calls[0][0];
      const thEntry =
        byKey(mapArg, contentValidations.NODE_SHOULD_NOT_BE_EMPTY + '') &&
        [...mapArg.values()].find(
          (v) =>
            v.validatorKey === contentValidations.NODE_SHOULD_NOT_BE_EMPTY && v.tipPayload?.nodeType === 'tableHeader',
        );
      const tdEntry = [...mapArg.values()].find(
        (v) => v.validatorKey === contentValidations.NODE_SHOULD_NOT_BE_EMPTY && v.tipPayload?.nodeType === 'tableCell',
      );
      expect(thEntry).toBeDefined();
      expect(tdEntry).toBeDefined();
    });

    it('returns an empty caption warning', async () => {
      const callback = vi.fn();
      await createTestEditor(
        `
        <h1>Title</h1>
        <table>
          <caption></caption>
          <thead>
            <tr>
              <th>tablehead</th>
              <th>tablehead</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>table body cell</td>
              <td>table body cell</td>
            </tr>
          </tbody>
        </table>`,
        callback,
      );
      expect(byKey(callback.mock.calls[0][0], contentValidations.NODE_SHOULD_NOT_BE_EMPTY)?.tipPayload?.nodeType).toBe(
        'tableCaption',
      );
    });
  });

  describe('Empty nodes', () => {
    it.each([
      {
        description: 'empty paragraph',
        html: '<p></p>',
        nodeType: 'paragraph',
      },
      {
        description: 'paragraph with only whitespace',
        html: '<p> </p>',
        nodeType: 'paragraph',
      },
      {
        description: 'empty list item',
        html: '<ul><li></li></ul>',
        nodeType: 'listItem',
      },
      {
        description: 'list item with only whitespace',
        html: '<ul><li> </li></ul>',
        nodeType: 'listItem',
      },
      {
        description: 'empty definition term',
        html: '<dl><dt></dt><dd>Description</dd></dl>',
        nodeType: 'definitionTerm',
      },
      {
        description: 'definition term with only whitespace',
        html: '<dl><dt> </dt><dd>Description</dd></dl>',
        nodeType: 'definitionTerm',
      },
      {
        description: 'empty definition description',
        html: '<dl><dt>Term</dt><dd></dd></dl>',
        nodeType: 'definitionDescription',
      },
      {
        description: 'definition description with only whitespace',
        html: '<dl><dt>Term</dt><dd> </dd></dl>',
        nodeType: 'definitionDescription',
      },
      {
        description: 'empty table header',
        html: '<table><tr><th></th></tr></table>',
        nodeType: 'tableHeader',
      },
      {
        description: 'table header with only whitespace',
        html: '<table><tr><th> </th></tr></table>',
        nodeType: 'tableHeader',
      },
      {
        description: 'empty table cell',
        html: '<table><tr><td></td></tr></table>',
        nodeType: 'tableCell',
      },
      {
        description: 'table cell with only whitespace',
        html: '<table><tr><td> </td></tr></table>',
        nodeType: 'tableCell',
      },
      {
        description: 'empty table caption',
        html: '<table><caption></caption><tr><td>cell</td></tr></table>',
        nodeType: 'tableCaption',
      },
      {
        description: 'table caption with only whitespace',
        html: '<table><caption> </caption><tr><td>cell</td></tr></table>',
        nodeType: 'tableCaption',
      },
    ])('should detect $description', async ({ html, nodeType }) => {
      const callback = vi.fn();
      await createTestEditor(`<h1>Title</h1>${html}`, callback);

      await vi.waitFor(() => {
        expect(callback).toHaveBeenCalledTimes(1);
      });

      const validationMap = callback.mock.calls[0][0];
      expect(validationMap).toBeInstanceOf(Map);

      // Find the validation error for this node type
      const validation = byKey(validationMap, contentValidations.NODE_SHOULD_NOT_BE_EMPTY);

      expect(validation).toBeDefined();
      expect(validation!.severity).toBe('info');
      expect(validation!.tipPayload!.nodeType).toBe(nodeType);
    });

    it.each([
      {
        html: '<p>Some text content</p>',
        nodeType: 'paragraph',
      },
      {
        html: '<ul><li>Item text</li></ul>',
        nodeType: 'listItem',
      },
      {
        html: '<dl><dt>Term text</dt><dd>Description</dd></dl>',
        nodeType: 'definitionTerm',
      },
      {
        html: '<dl><dt>Term</dt><dd>Description text</dd></dl>',
        nodeType: 'definitionDescription',
      },
      {
        html: '<table><tr><th>Header text</th></tr></table>',
        nodeType: 'tableHeader',
      },
      {
        html: '<table><tr><td>Cell text</td></tr></table>',
        nodeType: 'tableCell',
      },
      {
        html: '<table><caption>Caption text</caption><tr><td>cell</td></tr></table>',
        nodeType: 'tableCaption',
      },
    ])('should not flag non-empty $nodeType with text', async ({ html }) => {
      const callback = vi.fn();
      await createTestEditor(`<h1>Title</h1>${html}`, callback);

      await vi.waitFor(() => {
        expect(callback).toHaveBeenCalled();
      });

      const validationMap = callback.mock.calls[0][0];

      // Should not have empty node validation error
      expect(byKey(validationMap, contentValidations.NODE_SHOULD_NOT_BE_EMPTY)).toBeUndefined();
    });

    it('should detect multiple empty nodes in the same document', async () => {
      const callback = vi.fn();
      await createTestEditor(
        `<h1>Title</h1>
        <p></p>
        <ul>
          <li>Valid item</li>
          <li> </li>
        </ul>
        <dl>
          <dt>Valid term</dt>
          <dd>Valid description</dd>
        </dl>
        <dl>
          <dt></dt><dd></dd>
        </dl>
        <table>
          <tr><th>Header</th><th> </th></tr>
          <tr><td>Cell</td><td></td></tr>
        </table>`,
        callback,
      );

      await vi.waitFor(() => {
        expect(callback).toHaveBeenCalledTimes(1);
      });

      const validationMap = callback.mock.calls[0][0];
      const emptyNodeErrors = allByKey(validationMap, contentValidations.NODE_SHOULD_NOT_BE_EMPTY);

      // Should have multiple empty node errors
      expect(emptyNodeErrors.length).toBeGreaterThan(0);
    });
  });

  describe('Empty marks', () => {
    describe.each([
      {
        html: '<b>&nbsp;</b>',
        nodeType: 'bold',
      },
      {
        html: '<strong>&nbsp;</strong>',
        nodeType: 'bold',
      },
      {
        html: '<i>&nbsp;</i>',
        nodeType: 'italic',
      },
      {
        html: '<em>&nbsp;</em>',
        nodeType: 'italic',
      },
      {
        html: '<s>&nbsp;</s>',
        nodeType: 'strike',
      },
      {
        html: '<strike>&nbsp;</strike>',
        nodeType: 'strike',
      },
      {
        html: '<del>&nbsp;</del>',
        nodeType: 'strike',
      },
      {
        html: '<u>&nbsp;</u>',
        nodeType: 'underline',
      },
      {
        html: '<mark>&nbsp;</mark>',
        nodeType: 'highlight',
      },
      {
        html: '<a href="https://example.com">&nbsp;</a>',
        nodeType: 'link',
      },
      {
        html: '<code>&nbsp;</code>',
        nodeType: 'code',
      },
    ])('should detect empty $nodeType with non-breaking space', ({ html, nodeType }) => {
      it(`validates ${nodeType} is empty`, async () => {
        const callback = vi.fn();
        await createTestEditor(`<h1>Title</h1><p>Text with ${html} here</p>`, callback);

        await vi.waitFor(() => {
          expect(callback).toHaveBeenCalledTimes(1);
        });

        const validationMap = callback.mock.calls[0][0];
        expect(validationMap).toBeInstanceOf(Map);

        // Find the validation error for this mark
        const validation = byKey(validationMap, contentValidations.MARK_SHOULD_NOT_BE_EMPTY);

        expect(validation).toBeDefined();
        expect(validation!.severity).toBe('info');
        expect(validation!.tipPayload!.nodeType).toBe(nodeType);
      });
    });

    it.each([
      {
        description: 'bold mark with text',
        html: '<b>text</b>',
        markName: 'bold',
      },
      {
        description: 'strong element with text',
        html: '<strong>text</strong>',
        markName: 'bold',
      },
      {
        description: 'italic mark with text',
        html: '<i>text</i>',
        markName: 'italic',
      },
      {
        description: 'emphasis element with text',
        html: '<em>text</em>',
        markName: 'italic',
      },
      {
        description: 'strikethrough mark with text',
        html: '<s>text</s>',
        markName: 'strike',
      },
      {
        description: 'del element with text',
        html: '<del>text</del>',
        markName: 'strike',
      },
      {
        description: 'underline mark with text',
        html: '<u>text</u>',
        markName: 'underline',
      },
      {
        description: 'highlight mark with text',
        html: '<mark>text</mark>',
        markName: 'highlight',
      },
      {
        description: 'link with text',
        html: '<a href="https://example.com">Link text</a>',
        markName: 'link',
      },
      {
        description: 'code mark with text',
        html: '<code>code text</code>',
        markName: 'code',
      },
    ])('should not flag non-empty $description', async ({ html }) => {
      const callback = vi.fn();
      await createTestEditor(`<h1>Title</h1><p>Text with ${html} here</p>`, callback);

      await vi.waitFor(() => {
        expect(callback).toHaveBeenCalled();
      });

      const validationMap = callback.mock.calls[0][0];

      // Should not have empty mark validation error
      expect(byKey(validationMap, contentValidations.MARK_SHOULD_NOT_BE_EMPTY)).toBeUndefined();
    });

    it('should detect multiple empty marks in the same document', async () => {
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
      const emptyMarkErrors = allByKey(validationMap, contentValidations.MARK_SHOULD_NOT_BE_EMPTY);

      // Should have 4 empty mark errors
      expect(emptyMarkErrors).toHaveLength(4);
    });

    it('should detect empty marks even when nested', async () => {
      const callback = vi.fn();
      await createTestEditor(`<h1>Title</h1><p>Nested: <b><i>&nbsp;</i></b></p>`, callback);

      await vi.waitFor(() => {
        expect(callback).toHaveBeenCalledTimes(1);
      });

      const validationMap = callback.mock.calls[0][0];
      const emptyMarkErrors = allByKey(validationMap, contentValidations.MARK_SHOULD_NOT_BE_EMPTY);

      // Should detect the empty text node with marks
      expect(emptyMarkErrors.length).toBeGreaterThan(0);
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
      expect(byKey(mapArg, contentValidations.MARK_SHOULD_NOT_BE_EMPTY)?.tipPayload?.nodeType).toBe('link');
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

      const genericLinkEntry = byKey(callback.mock.calls[0][0], contentValidations.LINK_SHOULD_NOT_BE_TOO_GENERIC);
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
      expect(byKey(callback.mock.calls[0][0], contentValidations.MARK_SHOULD_NOT_BE_UNDERLINED)?.severity).toBe('info');
    });
  });
});
