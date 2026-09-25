import { coreValidationRules, coreValidations } from '@nl-design-system-community/clippy-a11y-validator';
import { afterEach, describe, expect, it } from 'vitest';

const { PARAGRAPH_SHOULD_NOT_BE_EMPTY } = coreValidationRules;

const loadBundle = (name: string): Promise<typeof import('./getClippyPage')> =>
  import(/* @vite-ignore */ `./getClippyPage.ts?bundle=${name}`);

const createSource = (html: string, label: string) => {
  const fragment = document.createElement('div');
  fragment.innerHTML = html;
  document.body.append(fragment);
  return { anchor: fragment, fragment, label };
};

afterEach(() => {
  delete globalThis.__clippyPage;
  document.body.replaceChildren();
});

describe('getClippyPage', () => {
  it('hands every bundle on the page the same page', async () => {
    const editorPlugin = await loadBundle('editor-plugin');
    const panel = await loadBundle('panel');

    expect(editorPlugin.getClippyPage()).toBe(panel.getClippyPage());
  });

  it('shows sources registered by separate bundles in one report', async () => {
    const titleField = await loadBundle('title-field');
    const editorPlugin = await loadBundle('editor-plugin');
    const panel = await loadBundle('panel');
    editorPlugin.getClippyPage().registerValidation(coreValidations[PARAGRAPH_SHOULD_NOT_BE_EMPTY]);

    const { id: title } = titleField.getClippyPage().register(createSource('<p></p>', 'Title'));
    const { id: body } = editorPlugin.getClippyPage().register(createSource('<p></p>', 'Body'));
    await new Promise((resolve) => setTimeout(resolve));

    expect(panel.getClippyPage().violations.map(({ source }) => source)).toEqual([title, body]);
  });
});
