import { coreValidationRules, coreValidations } from '@nl-design-system-community/clippy-a11y-validator';
import { afterEach, describe, expect, it } from 'vitest';

const { PARAGRAPH_SHOULD_NOT_BE_EMPTY } = coreValidationRules;

const loadBundle = (name: string): Promise<typeof import('./getClippyRegistry')> =>
  import(/* @vite-ignore */ `./getClippyRegistry.ts?bundle=${name}`);

const createSource = (html: string, label: string) => {
  const root = document.createElement('div');
  root.innerHTML = html;
  document.body.append(root);
  return { anchor: root, label, root };
};

afterEach(() => {
  delete globalThis.__clippyRegistry;
  document.body.replaceChildren();
});

describe('getClippyRegistry', () => {
  it('hands every bundle on the page the same registry', async () => {
    const editorPlugin = await loadBundle('editor-plugin');
    const panel = await loadBundle('panel');

    expect(editorPlugin.getClippyRegistry()).toBe(panel.getClippyRegistry());
  });

  it('shows sources registered by separate bundles in one report', async () => {
    const titleField = await loadBundle('title-field');
    const editorPlugin = await loadBundle('editor-plugin');
    const panel = await loadBundle('panel');
    editorPlugin.getClippyRegistry().registerValidation(coreValidations[PARAGRAPH_SHOULD_NOT_BE_EMPTY]);

    const { id: title } = titleField.getClippyRegistry().register(createSource('<p></p>', 'Title'));
    const { id: body } = editorPlugin.getClippyRegistry().register(createSource('<p></p>', 'Body'));

    expect(panel.getClippyRegistry().violations.map(({ source }) => source)).toEqual([title, body]);
  });
});
