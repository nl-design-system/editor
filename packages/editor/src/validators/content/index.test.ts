import { describe, expect, it, vi } from 'vitest';
import { createTestEditor } from '../../../test/createTestEditor';

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
    it('should notify editor of empty nodes p, li, dt and dd', async () => {
      const callback = vi.fn();
      await createTestEditor(
        `
        <h1>foo</h1>
        <p></p>
        <ul>
          <li>foo</li>
          <li> </li>
        </ul>
        <dl>
          <dt>Term</dt>
          <dd>Description</dd>
        </dl>
        <dl>
          <dt></dt><dd></dd>
        </dl>`,
        callback,
      );

      await vi.waitFor(() => {
        expect(callback).toHaveBeenCalledTimes(1);
      });
      const mapArg = callback.mock.calls[0][0];
      expect(mapArg).toBeInstanceOf(Map);
      expect(mapArg.get('node-should-not-be-empty_5').tipPayload.nodeType).toBe('paragraph');
      expect(mapArg.get('node-should-not-be-empty_13').tipPayload.nodeType).toBe('listItem');
      expect(mapArg.get('node-should-not-be-empty_38').tipPayload.nodeType).toBe('definitionTerm');
      expect(mapArg.get('node-should-not-be-empty_40').tipPayload.nodeType).toBe('definitionDescription');
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
