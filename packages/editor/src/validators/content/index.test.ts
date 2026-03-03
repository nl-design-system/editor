import { describe, expect, it, vi } from 'vitest';
import { createTestEditor } from '../../../test/createTestEditor';
import { contentValidations } from '../constants';

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
      expect(mapArg.has('heading-must-not-be-empty_0')).toBeTruthy();
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
      expect(mapArg.has('document-must-have-semantic-lists_0')).toBeTruthy();
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
      expect(callback.mock.calls[0][0].get('description-list-must-contain-term_5').severity).toBe('error');
      expect(callback.mock.calls[0][0].get('definition-description-must-follow-term_8').severity).toBe('error');
      expect(callback.mock.calls[0][0].get('description-list-must-contain-term_20').severity).toBe('error');
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
      expect(mapArg.get('node-should-not-be-empty_16').tipPayload.nodeType).toBe('tableHeader');
      expect(mapArg.get('node-should-not-be-empty_22').tipPayload.nodeType).toBe('tableCell');
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
      expect(callback.mock.calls[0][0].get('node-should-not-be-empty_8').tipPayload.nodeType).toBe('tableCaption');
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
      const errorKey = Array.from(validationMap.keys()).find((key) =>
        (key as string).startsWith(`${contentValidations.NODE_SHOULD_NOT_BE_EMPTY}_`),
      );

      expect(errorKey).toBeDefined();
      const validation = validationMap.get(errorKey!);
      expect(validation.severity).toBe('info');
      expect(validation.tipPayload.nodeType).toBe(nodeType);
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
      const errorKey = Array.from(validationMap.keys()).find((key) =>
        (key as string).startsWith(`${contentValidations.NODE_SHOULD_NOT_BE_EMPTY}_`),
      );

      expect(errorKey).toBeUndefined();
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
      const emptyNodeErrors = Array.from(validationMap.keys()).filter((key) =>
        (key as string).startsWith(`${contentValidations.NODE_SHOULD_NOT_BE_EMPTY}_`),
      );

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
        const errorKey = Array.from(validationMap.keys()).find((key) =>
          (key as string).startsWith(`${contentValidations.MARK_SHOULD_NOT_BE_EMPTY}_`),
        );

        expect(errorKey).toBeDefined();
        const validation = validationMap.get(errorKey!);
        expect(validation.severity).toBe('info');
        expect(validation.tipPayload.nodeType).toBe(nodeType);
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
      const errorKey = Array.from(validationMap.keys()).find((key) =>
        (key as string).startsWith(`${contentValidations.MARK_SHOULD_NOT_BE_EMPTY}_`),
      );

      expect(errorKey).toBeUndefined();
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
      const emptyMarkErrors = Array.from(validationMap.keys()).filter((key) =>
        (key as string).startsWith(`${contentValidations.MARK_SHOULD_NOT_BE_EMPTY}_`),
      );

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
      const emptyMarkErrors = Array.from(validationMap.keys()).filter((key) =>
        (key as string).startsWith(`${contentValidations.MARK_SHOULD_NOT_BE_EMPTY}_`),
      );

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
      expect(mapArg.get('mark-should-not-be-empty_24').tipPayload.nodeType).toBe('link');
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

      expect(callback.mock.calls[0][0].get('link-should-not-be-too-generic_51').severity).toBe('info');
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
      expect(callback.mock.calls[0][0].get('mark-should-not-be-underlined_19').severity).toBe('info');
    });
  });
});
