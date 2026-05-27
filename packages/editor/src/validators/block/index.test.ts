import { describe, expect, it, vi } from 'vitest';
import type { ValidationResult } from '../../types/validation.ts';
import { createTestEditor } from '../../../test/createTestEditor';
import { blockValidations } from '../../constants';
import { paragraphMustUseSemanticList } from './index';

const byKey = (map: Map<Range, ValidationResult>, key: string): ValidationResult | undefined =>
  [...map.values()].find((v) => v.validatorKey === key);

const allByKey = (map: Map<Range, ValidationResult>, key: string): ValidationResult[] =>
  [...map.values()].filter((v) => v.validatorKey === key);

describe('Block validations', () => {
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
      expect(byKey(mapArg, blockValidations.HEADING_MUST_NOT_BE_EMPTY)).toBeDefined();
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
      expect(byKey(mapArg, blockValidations.PARAGRAPH_MUST_USE_SEMANTIC_LIST)).toBeDefined();
    });

    it('returns errors for potential lists', async () => {
      const editor = await createTestEditor(`
        <h3>Enkele paragraaf test</h3>
            <p>- Lijst item<br />- Lijst item<br />- Lijst item</p>
            <h3>Correct lijst</h3>
            <ul>
              <li>Test</li>
              <li>Test</li>
              <li>Test</li>
            </ul>
            <h3>Incorrect geordende lijst</h3>
            <p>1 - Test<br />2 - Test<br />3 - Test</p>
            <p>1. Test<br>2. Test<br>3. Test</p>
            <h3>Correcte geordende lijst</h3>
            <ol>
              <li>Test</li>
              <li>Test</li>
              <li>Test</li>
            </ol>
            <h3>Losse paragrafen, waarschijnlijk een ongeordende lijst</h3>
            <p>- Losse paragrafen test</p>
            <p>- Losse paragrafen test</p>
            <p>- Losse paragrafen test<br />- Losse paragrafen test</p>
            <h3>test</h3>
            <p>* Losse paragrafen test<br />* Losse paragrafen test<br/>* Losse paragrafen test</p>
            <h3>Losse paragrafen, waarschijnlijk een geordende lijst</h3>
            <p>1 - Losse paragrafen test</p>
            <p>2 - Losse paragrafen test</p>
            <p>3 - Losse paragrafen test</p>
      `);

      const dom = editor.view.dom;
      const results = Array.from(dom.querySelectorAll('p'))
        .map((p) => paragraphMustUseSemanticList(dom, p))
        .filter((r): r is ValidationResult => r !== null);

      results.forEach((result) => {
        expect(result.severity).toEqual('info');
      });
      expect(results[0].tipPayload).toEqual({ prefix: '-' });
      expect(results[1].tipPayload).toEqual({ prefix: '1' });
      expect(results[2].tipPayload).toEqual({ prefix: '1.' });
      expect(results[3].tipPayload).toEqual({ prefix: '-' });
      expect(results[4].tipPayload).toEqual({ prefix: '-' });
      expect(results[5].tipPayload).toEqual({ prefix: '-' });
      expect(results[6].tipPayload).toEqual({ prefix: '*' });
      expect(results[7].tipPayload).toEqual({ prefix: '1' });
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
        byKey(mapArg, blockValidations.NODE_SHOULD_NOT_BE_EMPTY + '') &&
        [...mapArg.values()].find(
          (v) =>
            v.validatorKey === blockValidations.NODE_SHOULD_NOT_BE_EMPTY &&
            v.tipPayload?.['nodeType'] === 'tableHeader',
        );
      const tdEntry = [...mapArg.values()].find(
        (v) =>
          v.validatorKey === blockValidations.NODE_SHOULD_NOT_BE_EMPTY && v.tipPayload?.['nodeType'] === 'tableCell',
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
      expect(
        byKey(callback.mock.calls[0][0], blockValidations.NODE_SHOULD_NOT_BE_EMPTY)?.tipPayload?.['nodeType'],
      ).toBe('tableCaption');
    });
  });

  describe('Empty nodes', () => {
    it.each([
      { description: 'empty paragraph', html: '<p></p>', nodeType: 'paragraph' },
      { description: 'paragraph with only whitespace', html: '<p> </p>', nodeType: 'paragraph' },
      { description: 'empty list item', html: '<ul><li></li></ul>', nodeType: 'listItem' },
      { description: 'list item with only whitespace', html: '<ul><li> </li></ul>', nodeType: 'listItem' },
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
      { description: 'empty table header', html: '<table><tr><th></th></tr></table>', nodeType: 'tableHeader' },
      {
        description: 'table header with only whitespace',
        html: '<table><tr><th> </th></tr></table>',
        nodeType: 'tableHeader',
      },
      { description: 'empty table cell', html: '<table><tr><td></td></tr></table>', nodeType: 'tableCell' },
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

      const validation = byKey(validationMap, blockValidations.NODE_SHOULD_NOT_BE_EMPTY);

      expect(validation).toBeDefined();
      expect(validation!.severity).toBe('info');
      expect(validation!.tipPayload!['nodeType']).toBe(nodeType);
    });

    it.each([
      { html: '<p>Some text content</p>', nodeType: 'paragraph' },
      { html: '<ul><li>Item text</li></ul>', nodeType: 'listItem' },
      { html: '<dl><dt>Term text</dt><dd>Description</dd></dl>', nodeType: 'definitionTerm' },
      { html: '<dl><dt>Term</dt><dd>Description text</dd></dl>', nodeType: 'definitionDescription' },
      { html: '<table><tr><th>Header text</th></tr></table>', nodeType: 'tableHeader' },
      { html: '<table><tr><td>Cell text</td></tr></table>', nodeType: 'tableCell' },
      { html: '<table><caption>Caption text</caption><tr><td>cell</td></tr></table>', nodeType: 'tableCaption' },
    ])('should not flag non-empty $nodeType with text', async ({ html }) => {
      const callback = vi.fn();
      await createTestEditor(`<h1>Title</h1>${html}`, callback);

      await vi.waitFor(() => {
        expect(callback).toHaveBeenCalled();
      });

      const validationMap = callback.mock.calls[0][0];
      expect(byKey(validationMap, blockValidations.NODE_SHOULD_NOT_BE_EMPTY)).toBeUndefined();
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
      const emptyNodeErrors = allByKey(validationMap, blockValidations.NODE_SHOULD_NOT_BE_EMPTY);
      expect(emptyNodeErrors.length).toBeGreaterThan(0);
    });
  });

  describe('Tables', () => {
    it('returns no errors for table with header row', async () => {
      const callback = vi.fn();
      await createTestEditor(
        `<h1>Title</h1><table><thead><tr><th>H1</th><th>H2</th></tr></thead><tbody><tr><td>C1</td><td>C2</td></tr></tbody></table>`,
        callback,
      );
      await vi.waitFor(() => expect(callback).toHaveBeenCalledTimes(1));
      expect(byKey(callback.mock.calls[0][0], blockValidations.TABLE_MUST_HAVE_HEADINGS)).toBeUndefined();
    });

    it('returns no errors for table with header column', async () => {
      const callback = vi.fn();
      await createTestEditor(
        `<h1>Title</h1><table><tbody><tr><th>R1</th><td>C1</td></tr><tr><th>R2</th><td>C2</td></tr></tbody></table>`,
        callback,
      );
      await vi.waitFor(() => expect(callback).toHaveBeenCalledTimes(1));
      expect(byKey(callback.mock.calls[0][0], blockValidations.TABLE_MUST_HAVE_HEADINGS)).toBeUndefined();
    });

    it('returns warning for table without header cells', async () => {
      const callback = vi.fn();
      await createTestEditor(
        `<h1>Title</h1><table><tbody><tr><td>C1</td><td>C2</td></tr><tr><td>C3</td><td>C4</td></tr></tbody></table>`,
        callback,
      );
      await vi.waitFor(() => expect(callback).toHaveBeenCalledTimes(1));
      expect(byKey(callback.mock.calls[0][0], blockValidations.TABLE_MUST_HAVE_HEADINGS)?.severity).toBe('warning');
    });

    it('returns warning for table with a single row', async () => {
      const callback = vi.fn();
      await createTestEditor(`<h1>Title</h1><table><tbody><tr><td>C1</td><td>C2</td></tr></tbody></table>`, callback);
      await vi.waitFor(() => expect(callback).toHaveBeenCalledTimes(1));
      expect(byKey(callback.mock.calls[0][0], blockValidations.TABLE_MUST_HAVE_MULTIPLE_ROWS)?.severity).toBe(
        'warning',
      );
    });

    it('returns no error for table with multiple rows', async () => {
      const callback = vi.fn();
      await createTestEditor(
        `<h1>Title</h1><table><thead><tr><th>H1</th></tr></thead><tbody><tr><td>C1</td></tr></tbody></table>`,
        callback,
      );
      await vi.waitFor(() => expect(callback).toHaveBeenCalledTimes(1));
      expect(byKey(callback.mock.calls[0][0], blockValidations.TABLE_MUST_HAVE_MULTIPLE_ROWS)).toBeUndefined();
    });
  });

  describe('Paragraph resembling heading', () => {
    it('flags a short all-bold paragraph as resembling a heading', async () => {
      const callback = vi.fn();
      await createTestEditor(`<h1>Title</h1><p><strong>Short bold text</strong></p>`, callback);
      await vi.waitFor(() => expect(callback).toHaveBeenCalledTimes(1));
      expect(byKey(callback.mock.calls[0][0], blockValidations.PARAGRAPH_SHOULD_NOT_RESEMBLE_HEADING)?.severity).toBe(
        'info',
      );
    });

    it('does not flag a paragraph with mixed content', async () => {
      const callback = vi.fn();
      await createTestEditor(`<h1>Title</h1><p>Some <strong>bold</strong> and plain text</p>`, callback);
      await vi.waitFor(() => expect(callback).toHaveBeenCalledTimes(1));
      expect(byKey(callback.mock.calls[0][0], blockValidations.PARAGRAPH_SHOULD_NOT_RESEMBLE_HEADING)).toBeUndefined();
    });

    it('does not flag a long all-bold paragraph', async () => {
      const callback = vi.fn();
      await createTestEditor(
        `<h1>Title</h1><p><strong>This is a very long bold paragraph that exceeds the character limit for heading detection</strong></p>`,
        callback,
      );
      await vi.waitFor(() => expect(callback).toHaveBeenCalledTimes(1));
      expect(byKey(callback.mock.calls[0][0], blockValidations.PARAGRAPH_SHOULD_NOT_RESEMBLE_HEADING)).toBeUndefined();
    });
  });

  describe('Heading with bold or italic', () => {
    it('flags a heading that contains bold text', async () => {
      const callback = vi.fn();
      await createTestEditor(`<h1>Title</h1><h2><strong>Bold heading</strong></h2>`, callback);
      await vi.waitFor(() => expect(callback).toHaveBeenCalledTimes(1));
      expect(
        byKey(callback.mock.calls[0][0], blockValidations.HEADING_SHOULD_NOT_CONTAIN_BOLD_OR_ITALIC)?.severity,
      ).toBe('info');
    });

    it('flags a heading that contains italic text', async () => {
      const callback = vi.fn();
      await createTestEditor(`<h1>Title</h1><h2><em>Italic heading</em></h2>`, callback);
      await vi.waitFor(() => expect(callback).toHaveBeenCalledTimes(1));
      expect(
        byKey(callback.mock.calls[0][0], blockValidations.HEADING_SHOULD_NOT_CONTAIN_BOLD_OR_ITALIC)?.severity,
      ).toBe('info');
    });

    it('does not flag a heading with only plain text', async () => {
      const callback = vi.fn();
      await createTestEditor(`<h1>Title</h1><h2>Plain heading</h2>`, callback);
      await vi.waitFor(() => expect(callback).toHaveBeenCalledTimes(1));
      expect(
        byKey(callback.mock.calls[0][0], blockValidations.HEADING_SHOULD_NOT_CONTAIN_BOLD_OR_ITALIC),
      ).toBeUndefined();
    });
  });

  describe('Image alt text', () => {
    it('flags an image without an alt attribute', async () => {
      const callback = vi.fn();
      await createTestEditor(`<h1>Title</h1><p><img src="https://example.com/img.jpg" /></p>`, callback);
      await vi.waitFor(() => expect(callback).toHaveBeenCalledTimes(1));
      expect(byKey(callback.mock.calls[0][0], blockValidations.IMAGE_MUST_HAVE_ALT_TEXT)?.severity).toBe('info');
    });

    it('flags an image with an empty alt attribute', async () => {
      const callback = vi.fn();
      await createTestEditor(`<h1>Title</h1><p><img src="https://example.com/img.jpg" alt="" /></p>`, callback);
      await vi.waitFor(() => expect(callback).toHaveBeenCalledTimes(1));
      expect(byKey(callback.mock.calls[0][0], blockValidations.IMAGE_MUST_HAVE_ALT_TEXT)?.severity).toBe('info');
    });

    it('does not flag an image with a descriptive alt attribute', async () => {
      const callback = vi.fn();
      await createTestEditor(
        `<h1>Title</h1><p><img src="https://example.com/img.jpg" alt="A description of the image" /></p>`,
        callback,
      );
      await vi.waitFor(() => expect(callback).toHaveBeenCalledTimes(1));
      expect(byKey(callback.mock.calls[0][0], blockValidations.IMAGE_MUST_HAVE_ALT_TEXT)).toBeUndefined();
    });
  });
});
