import { vi, describe, it, expect } from 'vitest';
import { createTestEditor } from '../../../test/createTestEditor';
import {
  documentMustHaveCorrectHeadingOrder,
  documentMustHaveSemanticLists,
  documentMustHaveTableWithHeadings,
} from './index';

describe('Document validations', () => {
  describe('Headings', () => {
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
      expect(mapArg.has('document-must-have-correct-heading-order_7')).toBeTruthy();
    });

    it('returns null for correct heading order', async () => {
      const editor = await createTestEditor(
        `
        <h1>Title</h1>
        <h2>Subtitle</h2>
        <p>Text</p>
      `,
      );

      const result = documentMustHaveCorrectHeadingOrder(editor);
      expect(result).toStrictEqual([]);
    });

    it('returns error for invalid heading order', async () => {
      const editor = await createTestEditor(`
        <h1>Title</h1>
        <h3>Subtitle</h3>
      `);

      const result = documentMustHaveCorrectHeadingOrder(editor);
      expect(result).toEqual([
        {
          boundingBox: expect.any(Object),
          pos: 7,
          severity: 'warning',
          tipPayload: {
            headingLevel: 3,
            precedingHeadingLevel: 1,
          },
        },
      ]);
    });

    it('returns error for invalid heading order with top level heading 2', async () => {
      const editor = await createTestEditor(
        `
      <h1>Title</h1>
      <h2>Subtitle</h2>
      <h4>Subtitle</h4>
    `,
        undefined,
        { topHeadingLevel: 2 },
      );

      const result = documentMustHaveCorrectHeadingOrder(editor, { topHeadingLevel: 2 });
      expect(result).toEqual([
        {
          boundingBox: expect.any(Object),
          pos: 0,
          severity: 'error',
          tipPayload: {
            exceedsTopLevel: true,
            headingLevel: 1,
            precedingHeadingLevel: 2,
          },
        },
        {
          boundingBox: expect.any(Object),
          pos: 17,
          severity: 'warning',
          tipPayload: {
            headingLevel: 4,
            precedingHeadingLevel: 2,
          },
        },
      ]);
    });

    it('returns error when content contains multiple level 1 headings', async () => {
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
      const mapArg = callback.mock.calls[0][0];
      expect(mapArg.get('document-must-have-single-heading-one_23').pos).toBe(23);
    });

    it('returns error for invalid top level heading', async () => {
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
      expect(mapArg.get('document-must-have-top-level-heading_1')).toEqual({
        boundingBox: expect.any(Object),
        pos: 1,
        severity: 'info',
      });
    });

    describe('Lists', () => {
      it('returns the ValidationMap after Editor.onCreated', async () => {
        const callback = vi.fn();

        await createTestEditor(
          `
          <h1>test</h1>
          <p>1 - single Test<br />2 - Test<br />3 - Test</p>
          <p>1. Test<br>2. Test<br>3. Test</p>
      `,
          callback,
        );
        await vi.waitFor(() => {
          expect(callback).toHaveBeenCalledTimes(1);
        });
        const mapArg = callback.mock.calls[0][0];
        expect(mapArg).toBeInstanceOf(Map);
        expect(mapArg.has('document-must-have-semantic-lists_6')).toBeTruthy();
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

        const results = documentMustHaveSemanticLists(editor);

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

    describe('Tables', () => {
      it('parses table html correctly it returns', async () => {
        const editor = await createTestEditor(`
      <h1>Title</h1>
      <table>
        <caption>caption</caption>
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
      </table>`);
        expect(editor.getHTML()).toEqual(
          `<h1 class="nl-heading nl-heading--level-1">Title</h1><table class="utrecht-table"><caption>caption</caption><thead><tr><th colspan="1" rowspan="1"><p class="nl-paragraph">tablehead</p></th><th colspan="1" rowspan="1"><p class="nl-paragraph">tablehead</p></th></tr></thead><tbody headrows="0" rowheadcolumns="0"><tr><td colspan="1" rowspan="1"><p class="nl-paragraph">table body cell</p></td><td colspan="1" rowspan="1"><p class="nl-paragraph">table body cell</p></td></tr></tbody></table>`,
        );
      });

      it('returns no errors for table with header row in thead', async () => {
        const editor = await createTestEditor(`
      <h1>Title</h1>
      <table>
        <thead>
          <tr>
            <th>Header 1</th>
            <th>Header 2</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Cell 1</td>
            <td>Cell 2</td>
          </tr>
        </tbody>
      </table>
    `);

        const result = documentMustHaveTableWithHeadings(editor);
        expect(result).toStrictEqual([]);
      });

      it('returns no errors for table with header row in tbody', async () => {
        const editor = await createTestEditor(`
      <h1>Title</h1>
      <table>
        <tbody>
          <tr>
            <th>Header 1</th>
            <th>Header 2</th>
          </tr>
          <tr>
            <td>Cell 1</td>
            <td>Cell 2</td>
          </tr>
        </tbody>
      </table>
    `);

        const result = documentMustHaveTableWithHeadings(editor);
        expect(result).toStrictEqual([]);
      });

      it('returns no errors for table with header column', async () => {
        const editor = await createTestEditor(`
      <h1>Title</h1>
      <table>
        <tbody>
          <tr>
            <th>Row header 1</th>
            <td>Cell 1</td>
          </tr>
          <tr>
            <th>Row header 2</th>
            <td>Cell 2</td>
          </tr>
        </tbody>
      </table>
    `);

        const result = documentMustHaveTableWithHeadings(editor);
        expect(result).toStrictEqual([]);
      });

      it('returns error for table without header cells', async () => {
        const editor = await createTestEditor(`
      <h1>Title</h1>
      <table>
        <tbody>
          <tr>
            <td>Cell 1</td>
            <td>Cell 2</td>
          </tr>
          <tr>
            <td>Cell 3</td>
            <td>Cell 4</td>
          </tr>
          <tr>
            <td>Cell 5</td>
            <td>Cell 6</td>
          </tr>
        </tbody>
      </table>
    `);

        const result = documentMustHaveTableWithHeadings(editor);
        expect(result).toEqual([
          {
            boundingBox: expect.any(Object),
            pos: 7,
            severity: 'warning',
          },
        ]);
      });

      it('returns no error for table with both header row and header column', async () => {
        const editor = await createTestEditor(`
      <h1>Title</h1>
      <table>
        <tbody>
          <tr>
            <th>Header cell</th>
            <th>Header cell</th>
          </tr>
          <tr>
            <th>Cell 1</th>
            <td>Cell 2</td>
          </tr>
          <tr>
            <th>Cell 3</th>
            <td>Cell 4</td>
          </tr>
          <tr>
            <th>Cell 5</th>
            <td>Cell 6</td>
          </tr>
        </tbody>
      </table>
    `);

        const result = documentMustHaveTableWithHeadings(editor);
        expect(result).toEqual([]);
      });

      it('returns error for table with single row', async () => {
        const editor = await createTestEditor(`
        <h1>Title</h1>
        <table>
          <tbody>
            <tr>
              <td>Single row table cell</td>
              <td>Single row table cell</td>
            </tr>
          </tbody>
        </table>
      `);

        const result = documentMustHaveTableWithHeadings(editor);
        expect(result).toEqual([
          {
            boundingBox: expect.any(Object),
            pos: 7,
            severity: 'warning',
          },
        ]);
      });
    });
  });
});
