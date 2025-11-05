import { vi, describe, it, expect } from 'vitest';
import { createTestEditor } from '../../../test/createTestEditor.ts';
import { documentMustHaveCorrectHeadingOrder } from './index.ts';

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
    expect(mapArg.has('document-must-have-correct-heading-order')).toBeTruthy();
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
    expect(result).toBeNull();
  });

  it('returns error for invalid heading order', () => {
    const editor = createTestEditor(`
      <h1>Title</h1>
      <h3>Subtitle</h3>
    `);

    const result = documentMustHaveCorrectHeadingOrder(editor);
    expect(result).toEqual({
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
    });
  });
});
