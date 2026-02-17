import './index.ts';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { initializeLocale } from '../../localization';

const tag = 'clippy-toolbar';

describe('<clippy-toolbar>', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(async () => {
    user = userEvent.setup();

    document.documentElement.lang = 'nl';
    await initializeLocale();
    document.body.innerHTML = `<${tag}></{tag}>`;
  });

  it('renders correctly with required toolbar elements', async () => {
    await vi.waitFor(() => {
      expect(page.getByLabelText('Werkbalk tekstbewerker')).toBeInTheDocument();
    });
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
    const linkButton = page.getByRole('button', { name: 'Link' }, { exact: true }).nth(1);
    await user.click(linkButton);
    expect(page.getByRole('dialog')).toHaveAttribute('open');
    const urlInput = page.getByLabelText('Link naar:');
    await user.type(urlInput, 'https://example.com');

    await user.keyboard('{Enter}');
    expect(page.getByLabelText('Link naar:')).toHaveValue('https://example.com');
    await user.click(page.getByRole('button', { name: 'Link toevoegen' }));
    expect(page.getByRole('dialog')).not.toBeInTheDocument();
  });

  it('adds an image when image upload is completed', async () => {
    const button = page.getByRole('button', { name: 'Afbeelding' });
    await button.click();
    expect(page.getByTestId('clippy-image-upload-dialog')).not.toHaveAttribute('open');
    const fileInput = page.getByTestId('clippy-image-upload');

    await userEvent.upload(fileInput, new File(['(⌐□_□)'], 'clippy.png', { type: 'image/png' }));

    expect(page.getByRole('listitem').getByRole('img')).toHaveAttribute('alt', 'clippy.png');
  });
});
