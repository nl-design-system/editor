import { vi, describe, it, expect } from 'vitest';
import { createTestEditor } from '../../../test/createTestEditor';
import { documentMustHaveCorrectHeadingOrder, documentMustHaveSemanticLists } from './index';

describe('Document validations', () => {
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
        boundingBox: {
          height: 0,
          top: 0,
        },
        pos: 7,
        severity: 'warning',
        tipPayload: {
          headingLevel: 3,
          precedingHeadingLevel: 1,
        },
      },
    ]);
  });

  it('returns error for invalid top level heading', async () => {
    const callback = vi.fn();

    await createTestEditor(
      `
      <h1>Title</h1>
      <p>Text</p>
    `,
      callback,
      { topHeadingLevel: 2 },
    );
    await vi.waitFor(() => {
      expect(callback).toHaveBeenCalledTimes(1);
    });
    const mapArg = callback.mock.calls[0][0];
    expect(mapArg).toBeInstanceOf(Map);
    expect(mapArg.get('document-must-have-top-level-heading_0')).toEqual({
      boundingBox: null,
      pos: 0,
      severity: 'info',
      tipPayload: {
        topHeadingLevel: 2,
      },
    });
  });

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
