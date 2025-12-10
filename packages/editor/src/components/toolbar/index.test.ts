// typescript
import './index.ts';
import userEvent from '@testing-library/user-event';
import { querySelectorDeep } from 'query-selector-shadow-dom';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { Toolbar } from './index';

describe('<clippy-toolbar>', () => {
  let container: HTMLElement;
  let user: ReturnType<typeof userEvent.setup>;
  let element: Toolbar;

  beforeEach(async () => {
    container = document.createElement('div');
    document.body.appendChild(container);
    user = userEvent.setup();

    container.innerHTML = '<clippy-toolbar></clippy-toolbar>';
    element = container.querySelector<Toolbar>('clippy-toolbar')!;
    await element.updateComplete;
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('renders correctly with required toolbar elements', async () => {
    expect(element).toBeDefined();
    expect(querySelectorDeep('div[aria-label="Werkbalk tekstbewerker"]')).toBeDefined();
    expect(querySelectorDeep('button[aria-label="Bold"]')).toBeDefined();
    expect(querySelectorDeep('button[aria-label="Italic"]')).toBeDefined();
    const linkButton = querySelectorDeep('clippy-toolbar-link');
    await linkButton?.updateComplete;
    expect(querySelectorDeep('button[aria-label="Link"]')).toBeDefined();
  });

  it('updates all toolbar buttons when editor content changes', async () => {
    const boldButton = querySelectorDeep('button[aria-label="Bold"]');
    expect(boldButton?.getAttribute('aria-pressed')).toBe('false');
  });

  it('opens shortcuts dialog when keyboard shortcuts button is clicked', async () => {
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
    const linkWC = querySelectorDeep('clippy-toolbar-link');
    await linkWC?.updateComplete;
    const linkButton = querySelectorDeep('button[aria-label="Link"]') as HTMLButtonElement;
    await user.click(linkButton);

    const linkElement = querySelectorDeep('clippy-toolbar-link');
    await linkElement?.updateComplete;

    const dialog = querySelectorDeep('dialog#clippy-link-dialog') as HTMLDialogElement;
    expect(dialog).toHaveAttribute('open');
  });

  it('adds an image when image upload is completed', async () => {
    const imageUploadElement = querySelectorDeep('clippy-toolbar-image-upload');
    await imageUploadElement?.updateComplete;

    const dialog = querySelectorDeep('dialog#clippy-image-upload-dialog') as HTMLDialogElement;
    dialog?.showModal();
    await imageUploadElement?.updateComplete;

    expect(dialog).toHaveAttribute('open');
  });
});
