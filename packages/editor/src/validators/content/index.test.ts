import { describe, expect, it, vi } from 'vitest';
import { createTestEditor } from '../../../test/createTestEditor';

describe('Content validations', () => {
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
