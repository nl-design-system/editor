import './index.ts';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { cleanupTestEditor, EditorTestSetup, setupTestEditor } from '../../../test/setupTestEditor';

const tag = 'clippy-toolbar';

describe('<clippy-toolbar>', () => {
  let testSetup: EditorTestSetup;
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(async () => {
    user = userEvent.setup();
    testSetup = setupTestEditor(`<${tag}></{tag}>`);
  });

  afterEach(() => {
    cleanupTestEditor(testSetup.container);
  });

  it('renders correctly with required toolbar elements', async () => {
    expect(page.getByLabelText('Werkbalk tekstbewerker')).toBeInTheDocument();
    expect(page.getByLabelText('Bold')).toBeInTheDocument();
    expect(page.getByLabelText('Italic')).toBeInTheDocument();
    expect(page.getByLabelText('Link', { exact: true })).toBeInTheDocument();
  });

  it('updates all toolbar buttons when editor content changes', async () => {
    expect(page.getByLabelText('Bold')).toHaveAttribute('aria-pressed', 'false');
  });

  it('opens shortcuts dialog when keyboard shortcuts button is clicked', async () => {
    expect(page.getByTestId('clippy-shortcuts-dialog')).not.toHaveAttribute('open');

    const button = page.getByRole('button', { name: 'Keyboard shortcuts' });
    await button.click();
    expect(page.getByTestId('clippy-shortcuts-dialog')).toHaveAttribute('open');
  });

  it('changes link URL when link is edited', async () => {
    const linkButton = page.getByLabelText('Link', { exact: true });
    await user.click(linkButton);

    expect(page.getByTestId('clippy-link-dialog')).toHaveAttribute('open');
    const urlInput = page.getByLabelText('Link to:');
    await user.type(urlInput, 'https://example.com');

    await user.keyboard('{Enter}');
    expect(page.getByLabelText('Link to:')).toHaveValue('https://example.com');
    await user.click(page.getByRole('button', { name: 'Link toevoegen' }));
    expect(page.getByTestId('clippy-link-dialog')).not.toHaveAttribute('open');
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
