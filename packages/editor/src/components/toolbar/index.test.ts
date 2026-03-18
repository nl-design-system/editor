import '../../components/context/index.ts';
import './index.ts';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import type { Toolbar } from './index.ts';
import type { ToolbarConfig } from './toolbar-config.ts';

const tag = 'clippy-toolbar';

describe('<clippy-toolbar>', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(async () => {
    user = userEvent.setup();

    document.documentElement.lang = 'nl';
    document.body.innerHTML = `
      <clippy-context id="toolbar-test-editor">
        <${tag}></${tag}>
      </clippy-context>
    `;

    // Wait for the toolbar to be rendered inside the context
    await vi.waitFor(() => {
      expect(page.getByLabelText('Werkbalk tekstbewerker')).toBeInTheDocument();
    });
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders correctly with required toolbar elements', async () => {
    expect(page.getByLabelText('Werkbalk tekstbewerker')).toBeInTheDocument();
    expect(page.getByRole('button', { name: 'Vet' })).toBeInTheDocument();
    expect(page.getByRole('button', { name: 'Cursief' })).toBeInTheDocument();
    expect(page.getByRole('button', { name: 'Link', exact: true })).toBeInTheDocument();
  });

  it('updates all toolbar buttons when editor content changes', async () => {
    const btn = page.getByRole('button', { name: 'Vet' });
    expect(btn).toBeVisible();
    expect(btn).toHaveAttribute('aria-pressed', 'false');
  });

  it('opens shortcuts dialog when keyboard shortcuts button is clicked', async () => {
    expect(page.getByTestId('clippy-shortcuts-dialog')).not.toHaveAttribute('open');

    const button = page.getByRole('button', { name: 'Sneltoetsen' });
    await button.click();
    expect(page.getByTestId('clippy-shortcuts-dialog')).toHaveAttribute('open');
  });

  it('changes link URL when link is edited', async () => {
    const linkButton = page.getByRole('button', { name: 'Link', exact: true });
    await user.click(linkButton);
    expect(page.getByRole('dialog')).toHaveAttribute('open');
    const urlInput = page.getByLabelText('Link naar:');
    await user.type(urlInput, 'https://example.com');

    expect(page.getByLabelText('Link naar:')).toHaveValue('https://example.com');
    await user.click(page.getByRole('button', { name: 'Link toevoegen' }));
    expect(page.getByRole('dialog')).not.toBeInTheDocument();
  });

  it('adds an image when image upload is completed', async () => {
    // Upload directly via the hidden file input – this triggers the modal to open
    // without requiring the editor to be available first (no editor guard on this path)
    const fileInput = page.getByTestId('clippy-image-upload');
    await userEvent.upload(fileInput, new File(['(⌐□_□)'], 'clippy.png', { type: 'image/png' }));

    // clippy-modal calls showModal() on its inner <dialog> – check that element's open attribute
    await vi.waitFor(() => {
      expect(page.getByRole('dialog', { name: 'Afbeelding invoegen' })).toHaveAttribute('open');
    });

    // A preview <img> should appear with the filename as its alt text
    await vi.waitFor(() => {
      expect(page.getByRole('img')).toHaveAttribute('alt', 'clippy.png');
    });

    // The alt-text input should be pre-filled with the filename
    expect(page.getByLabelText('Alt-tekst:')).toHaveValue('clippy.png');
  });

  describe('group semantics', () => {
    it('renders groups with role="group"', async () => {
      const toolbar = document.querySelector(tag)!;
      const groups = toolbar.shadowRoot!.querySelectorAll('[role="group"]');

      expect(groups.length).toBeGreaterThan(0);
    });

    it('renders the toolbar wrapper with role="toolbar"', async () => {
      const toolbar = document.querySelector(tag)!;
      const wrapper = toolbar.shadowRoot!.querySelector('[role="toolbar"]');

      expect(wrapper).not.toBeNull();
      expect(wrapper).toHaveAccessibleName('Werkbalk tekstbewerker');
    });

    it('renders all expected groups from default config', async () => {
      const toolbar = document.querySelector(tag)!;
      const groups = toolbar.shadowRoot!.querySelectorAll('[role="group"]');

      // defaultToolbarConfig has 9 groups
      expect(groups.length).toBe(9);
    });

    it('renders no divider elements (dividers are CSS pseudo-elements)', async () => {
      const toolbar = document.querySelector(tag)!;
      const dividers = toolbar.shadowRoot!.querySelectorAll('.clippy-toolbar__divider');

      // Dividers are now rendered via ::before pseudo-elements, not DOM nodes
      expect(dividers.length).toBe(0);
    });
  });

  describe('custom config', () => {
    it('renders only configured items', async () => {
      const toolbar = document.querySelector(tag) as Toolbar;
      const customConfig: ToolbarConfig = [['bold', 'italic']];
      toolbar.config = customConfig;
      await vi.waitFor(() => {
        const groups = toolbar.shadowRoot!.querySelectorAll('[role="group"]');
        expect(groups.length).toBe(1);
      });

      expect(page.getByRole('button', { name: 'Vet' })).toBeInTheDocument();
      expect(page.getByRole('button', { name: 'Cursief' })).toBeInTheDocument();

      // Buttons not in the config should not render
      const undoButtons = toolbar.shadowRoot!.querySelectorAll('[data-toolbar-item="undo"]');
      expect(undoButtons.length).toBe(0);
    });
  });
});
