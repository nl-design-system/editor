import { coreValidationRules, coreValidations } from '@nl-design-system-community/clippy-a11y-validator';
import { afterEach, describe, expect, it } from 'vitest';

const { PARAGRAPH_SHOULD_NOT_BE_EMPTY } = coreValidationRules;

const loadBundle = (name: string): Promise<typeof import('./getClippyDocument')> =>
  import(/* @vite-ignore */ `./getClippyDocument.ts?bundle=${name}`);

const createSource = (html: string, label: string) => {
  const fragment = document.createElement('div');
  fragment.innerHTML = html;
  document.body.append(fragment);
  return { anchor: fragment, fragment, label };
};

afterEach(() => {
  delete globalThis.__clippyDocument;
  document.body.replaceChildren();
});

describe('getClippyDocument', () => {
  it('hands every bundle on the page the same document', async () => {
    const editorPlugin = await loadBundle('editor-plugin');
    const panel = await loadBundle('panel');

    expect(editorPlugin.getClippyDocument()).toBe(panel.getClippyDocument());
  });

  it('shows sources registered by separate bundles in one report', async () => {
    const titleField = await loadBundle('title-field');
    const editorPlugin = await loadBundle('editor-plugin');
    const panel = await loadBundle('panel');
    editorPlugin.getClippyDocument().registerValidation(coreValidations[PARAGRAPH_SHOULD_NOT_BE_EMPTY]);

    const { id: title } = titleField.getClippyDocument().register(createSource('<p></p>', 'Title'));
    const { id: body } = editorPlugin.getClippyDocument().register(createSource('<p></p>', 'Body'));
    await new Promise((resolve) => setTimeout(resolve));

    expect(panel.getClippyDocument().violations.map(({ source }) => source)).toEqual([title, body]);
  });
});
