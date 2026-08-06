import { type Gutter, validationInteractionMode } from '@nl-design-system-community/editor/gutter';
import { ClassicEditor, Essentials, Heading, Paragraph, type Editor } from 'ckeditor5';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { ClippyPlugin } from './ClippyPlugin.ts';

// CKEditor's toolbar observes its own size; jsdom has no ResizeObserver.
beforeAll(() => {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

let editor: Editor | undefined;

afterEach(async () => {
  await editor?.destroy();
  editor = undefined;
  document.body.innerHTML = '';
});

const createEditor = async (html: string): Promise<Editor> => {
  const element = document.createElement('div');
  document.body.append(element);

  editor = await ClassicEditor.create(element, {
    licenseKey: 'GPL',
    plugins: [Essentials, Paragraph, Heading, ClippyPlugin],
  });
  editor.setData(html);
  return editor;
};

describe('ClippyPlugin', () => {
  it('wires the gutter to open the drawer, scoped to the same editor identifier', async () => {
    await createEditor('<h2>Kop</h2><p>Tekst</p>');

    const gutter = document.querySelector('clippy-validations-gutter') as Gutter | null;
    const drawer = document.querySelector('clippy-validations-drawer');

    expect(gutter).not.toBeNull();
    expect(drawer).not.toBeNull();
    expect(gutter?.mode).toBe(validationInteractionMode.DRAWER);
    expect(gutter?.identifier).toBeTruthy();
    expect(gutter?.identifier).toBe((drawer as { identifier?: string } | null)?.identifier);
  });
});
