import userEvent from '@testing-library/user-event';
import './index.ts';
import { describe, it, expect, beforeEach } from 'vitest';
import { page } from 'vitest/browser';
import { isMacOS } from '@/utils/isMacOS.ts';
import './index';

describe('<clippy-editor>', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    document.body.innerHTML =
      '<clippy-editor><div slot="content" hidden><h1>Start met kopniveau 1</h1></div></clippy-editor>';
  });

  it('should change selected text to heading level 3', async () => {
    await expect(page.getByRole('heading', { name: 'Start met kopniveau 1' })).toBeInTheDocument();

    const boldButton = page.getByRole('button', { name: 'Bold' }).element();

    expect(boldButton).toBeInTheDocument();
    await user.click(boldButton);

    const text = page.getByText('Start met kopniveau 1').element();
    expect(text).toBeInTheDocument();

    // Select the text by simulating mouse selection
    await user.pointer([
      { keys: '[MouseLeft>]', target: text },
      { offset: text.textContent?.length, target: text },
      { keys: '[/MouseLeft]' },
    ]);

    const select = page.getByLabelText('Tekst formaat selecteren');
    expect(select).toBeInTheDocument();
    await user.selectOptions(select.element(), 'h3');

    const h3Text = page.getByRole('heading', { level: 3 });
    expect(h3Text).toHaveTextContent('Start met kopniveau 1');
  });

  it('should open the shortcuts dialog with Command/Control + Alt + T', async () => {
    const text = page.getByText('Start met kopniveau 1').element();
    expect(text).toBeInTheDocument();
    expect(page.getByLabelText('Toegankelijkheidsfouten', { exact: true })).not.toHaveAttribute('open');
    await user.click(text);
    if (isMacOS()) {
      await user.keyboard('{meta>}{alt>}{t}{/alt}{/meta}');
    } else {
      await user.keyboard('{control>}{alt>}{t}{/alt}{/control}');
    }
    const a11yDialog = page.getByRole('dialog').element();
    expect(a11yDialog).toHaveAttribute('open');

    expect(a11yDialog).toHaveTextContent('Geen toegankelijkheidsfouten gevonden.');
  });

  it('all toolbar buttons are visible, regardless of viewport size', async () => {
    expect(page.getByRole('button', { name: 'Bold' })).toBeVisible();
    expect(page.getByRole('button', { name: 'Italic' })).toBeVisible();
    expect(page.getByRole('button', { name: 'Underline' })).toBeVisible();
    expect(page.getByRole('button', { name: 'Undo' })).toBeVisible();
    expect(page.getByRole('button', { name: 'Redo' })).toBeVisible();
    expect(page.getByRole('button', { name: 'Ordered list' })).toBeVisible();
    expect(page.getByRole('button', { name: 'Bullet list' })).toBeVisible();
    expect(page.getByRole('button', { name: 'Definition list' })).toBeVisible();
    expect(page.getByRole('button', { name: 'Tabel invoegen' })).toBeVisible();
    expect(page.getByRole('button', { name: 'Link' })).toBeVisible();
    expect(page.getByRole('button', { name: 'Afbeelding' })).toBeVisible();
    expect(page.getByRole('button', { name: 'Keyboard shortcuts' })).toBeVisible();
    expect(page.getByRole('button', { name: 'Toon toegankelijkheidsfouten' })).toBeVisible();
  });
});
