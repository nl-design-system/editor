import '../../context/index.ts';
import './index.ts';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';

describe('<clippy-toolbar-link>', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(async () => {
    user = userEvent.setup();
    document.documentElement.lang = 'nl';
    document.documentElement.classList = 'ma-theme clippy-theme utrecht-root';
    document.body.innerHTML = `
      <clippy-context>
        <clippy-toolbar-link></clippy-toolbar-link>
      </clippy-context>
    `;

    await vi.waitFor(() => {
      expect(page.getByRole('button', { name: 'Link', exact: true })).toBeInTheDocument();
    });
  });

  it('renders the link toggle button', () => {
    expect(page.getByRole('button', { name: 'Link', exact: true })).toBeInTheDocument();
  });

  it('opens the dialog when the link button is clicked', async () => {
    await user.click(page.getByRole('button', { name: 'Link', exact: true }));
    await vi.waitFor(() => {
      expect(page.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('dialog', () => {
    beforeEach(async () => {
      await user.click(page.getByRole('button', { name: 'Link', exact: true }));
      await vi.waitFor(() => {
        expect(page.getByRole('dialog')).toHaveAttribute('open');
      });
    });

    it('closes when the close button is clicked', async () => {
      await user.click(page.getByRole('button', { name: 'Sluiten' }).nth(1));
      await vi.waitFor(() => {
        expect(page.getByLabelText('Link invoegen/bewerken')).not.toHaveAttribute('open');
      });
    });

    it('URL input accepts typed value', async () => {
      const urlInput = page.getByLabelText('Link naar:');
      await user.type(urlInput, 'https://example.com');
      expect(urlInput).toHaveValue('https://example.com');
    });

    it('Title input accepts typed value', async () => {
      const titleInput = page.getByPlaceholder('URL titel');
      await user.type(titleInput, 'My tooltip');
      expect(titleInput).toHaveValue('My tooltip');
    });

    it('does not render text preview when cursor is not in a link', () => {
      expect(page.getByLabelText('Voorbeeld linktekst').elements()).toHaveLength(0);
    });

    describe('target combobox', () => {
      it('renders with "Geen" selected by default', () => {
        const combobox = page.getByRole('combobox', { name: 'Selecteer linkdoel' });
        expect(combobox).toBeInTheDocument();
        expect(combobox).toHaveValue('');
      });

      it('selects "Nieuw venster"', async () => {
        const combobox = page.getByRole('combobox', { name: 'Selecteer linkdoel' });
        await user.click(combobox.element());
        await user.click(page.getByRole('option', { name: 'Nieuw venster' }).element());
        expect(combobox).toHaveValue('Nieuw venster');
      });

      it('selects "Huidig venster"', async () => {
        const combobox = page.getByRole('combobox', { name: 'Selecteer linkdoel' });
        await user.click(combobox.element());
        await user.click(page.getByRole('option', { name: 'Huidig venster' }).element());
        expect(combobox).toHaveValue('Huidig venster');
      });
    });

    it('shows "Link toevoegen" submit button when no link is active', () => {
      expect(page.getByRole('button', { name: 'Link toevoegen' })).toBeInTheDocument();
    });

    it('does not show "Link verwijderen" button when no link is active', () => {
      expect(page.getByRole('button', { name: 'Link verwijderen' }).elements()).toHaveLength(0);
    });

    it('closes after submitting a valid URL', async () => {
      await user.type(page.getByLabelText('Link naar:'), 'https://example.com');
      await user.click(page.getByRole('button', { name: 'Link toevoegen' }));
      await vi.waitFor(() => {
        expect(page.getByLabelText('Link invoegen/bewerken')).not.toHaveAttribute('open');
      });
    });
  });

  describe('dialog with active link', () => {
    beforeEach(async () => {
      document.body.innerHTML = `
        <clippy-context>
          <div slot="content"><p>Hello <a href="https://example.com">world</a> text</p></div>
          <clippy-toolbar-link></clippy-toolbar-link>
        </clippy-context>
      `;

      const ctx = document.querySelector('clippy-context')!;
      await vi.waitFor(() => {
        expect(ctx.editor).toBeTruthy();
      });

      // Position cursor inside the link text "world"
      ctx.editor!.commands.setTextSelection(8);

      await user.click(page.getByRole('button', { name: 'Link', exact: true }));
      await vi.waitFor(() => {
        expect(page.getByRole('dialog')).toHaveAttribute('open');
      });
    });

    it('populates URL from active link', () => {
      expect(page.getByLabelText('Link naar:')).toHaveValue('https://example.com');
    });

    it('renders link text preview with link content', () => {
      const textPreview = page.getByLabelText('Voorbeeld linktekst');
      expect(textPreview).toBeInTheDocument();
      expect(textPreview).toHaveTextContent('world');
    });

    it('shows "Bijwerken" submit button', () => {
      expect(page.getByRole('button', { name: 'Bijwerken' })).toBeInTheDocument();
    });

    it('shows "Link verwijderen" button', () => {
      expect(page.getByRole('button', { name: 'Link verwijderen' })).toBeInTheDocument();
    });

    it('removes link when "Link verwijderen" is clicked', async () => {
      const ctx = document.querySelector('clippy-context')!;
      await user.click(page.getByRole('button', { name: 'Link verwijderen' }));
      await vi.waitFor(() => {
        expect(page.getByLabelText('Link invoegen/bewerken')).not.toHaveAttribute('open');
      });
      expect(ctx.editor!.isActive('link')).toBe(false);
    });
  });
});
