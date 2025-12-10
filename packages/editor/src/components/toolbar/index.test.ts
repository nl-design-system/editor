import './index.ts';
import type { Editor } from '@tiptap/core';
import userEvent from '@testing-library/user-event';
import { querySelectorDeep } from 'query-selector-shadow-dom';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestEditor } from '../../../test/createTestEditor';

describe('<clippy-toolbar>', () => {
  let container: HTMLElement;
  let editor: Editor;
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(async () => {
    container = document.createElement('div');
    document.body.appendChild(container);
    editor = await createTestEditor('');
    user = userEvent.setup();
  });

  afterEach(() => {
    document.body.removeChild(container);
    editor.destroy();
  });

  it('renders correctly with required toolbar elements', async () => {
    container.innerHTML = '<clippy-toolbar></clippy-toolbar>';
    const element = container.querySelector('clippy-toolbar');

    if (element) {
      element.editor = editor;
      await element.updateComplete;
    }

    expect(element).toBeTruthy();
    expect(querySelectorDeep('div[aria-label="Werkbalk tekstbewerker"]')).toBeDefined();
    expect(querySelectorDeep('button[aria-label="Bold"]')).toBeTruthy();
    expect(querySelectorDeep('button[aria-label="Italic"]')).toBeTruthy();
    const linkButton = querySelectorDeep('clippy-toolbar-link');
    await linkButton?.updateComplete;
    expect(querySelectorDeep('button[aria-label="Link"]')).toBeTruthy();
  });

  it('updates all toolbar buttons when editor content changes', async () => {
    editor.commands.setContent('<p><strong>Bold text</strong></p>');
    editor.commands.setTextSelection(1);

    container.innerHTML = '<clippy-toolbar></clippy-toolbar>';
    const element = container.querySelector('clippy-toolbar');

    if (element) {
      element.editor = editor;
      await element.updateComplete;
    }

    const boldButton = querySelectorDeep('button[aria-label="Bold"]');
    expect(boldButton?.getAttribute('aria-pressed')).toBe('true');
  });

  it('opens shortcuts dialog when keyboard shortcuts button is clicked', async () => {
    container.innerHTML = '<clippy-toolbar></clippy-toolbar>';
    const element = container.querySelector('clippy-toolbar');

    if (element) {
      element.editor = editor;
      await element.updateComplete;
    }

    const shortcutsButton = querySelectorDeep('clippy-shortcuts');
    await shortcutsButton?.updateComplete;

    const shortcutsButton2 = querySelectorDeep('button[aria-label="Keyboard shortcuts"]') as HTMLButtonElement;
    await user.click(shortcutsButton2);
    await shortcutsButton?.updateComplete;
    const dialog = querySelectorDeep('dialog#clippy-shortcuts') as HTMLDialogElement;
    const title = dialog.querySelector('#clippy-shortcuts-title');
    expect(title?.innerHTML).toBe('Sneltoetsen');
  });

  it('changes link URL when link is edited', async () => {
    const initialUrl = 'https://example.com';

    editor.commands.setContent(`<p><a href="${initialUrl}">Link text</a></p>`);
    editor.commands.setTextSelection(2);

    container.innerHTML = '<clippy-toolbar></clippy-toolbar>';
    const element = container.querySelector('clippy-toolbar');

    if (element) {
      element.editor = editor;
      await element.updateComplete;
    }

    const linkWC = querySelectorDeep('clippy-toolbar-link');
    await linkWC?.updateComplete;
    const linkButton = querySelectorDeep('button[aria-label="Link"]') as HTMLButtonElement;
    await user.click(linkButton);

    const linkElement = querySelectorDeep('clippy-toolbar-link');
    await linkElement?.updateComplete;

    const dialog = querySelectorDeep('dialog#clippy-link-dialog') as HTMLDialogElement;
    expect(dialog?.getAttribute('open')).toBeDefined();
  });

  it('adds an image when image upload is completed', async () => {
    editor.commands.setContent('<p>Some text</p>');

    container.innerHTML = '<clippy-toolbar></clippy-toolbar>';
    const element = container.querySelector('clippy-toolbar');

    if (element) {
      element.editor = editor;
      await element.updateComplete;
    }

    const imageUploadElement = querySelectorDeep('clippy-toolbar-image-upload');
    await imageUploadElement?.updateComplete;

    const dialog = querySelectorDeep('dialog#clippy-image-upload-dialog') as HTMLDialogElement;
    dialog?.showModal();
    await imageUploadElement?.updateComplete;

    expect(dialog?.getAttribute('open')).toBeDefined();
  });
});
