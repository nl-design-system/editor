import { vi, describe, it, expect } from 'vitest';
import { createTestEditor } from '../../../test/createTestEditor';
import { documentMustHaveCorrectHeadingOrder } from './index';

describe('Document validations', () => {
  it('returns the ValidationMap after Editor.onCreated', async () => {
    const callback = vi.fn();

    createTestEditor(
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
    const editor = createTestEditor(
      `
      <h1>Title</h1>
      <h2>Subtitle</h2>
      <p>Text</p>
    `,
    );

    const result = documentMustHaveCorrectHeadingOrder(editor);
    expect(result).toStrictEqual([]);
  });

  it('returns error for invalid heading order', () => {
    const editor = createTestEditor(`
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

    createTestEditor(
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
});
