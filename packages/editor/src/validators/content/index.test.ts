import { describe, expect, it, vi } from 'vitest';
import { createTestEditor } from '../../../test/createTestEditor.ts';

describe('Content validations', () => {
  it('returns the ValidationMap after Editor.onCreated', async () => {
    const callback = vi.fn();

    createTestEditor(
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
    expect(mapArg.has('heading-must-not-be-empty')).toBeTruthy();
  });
});
