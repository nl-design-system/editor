import userEvent from '@testing-library/user-event';
import './index.ts';
import { querySelectorDeep } from 'query-selector-shadow-dom';
import { describe, it, expect, beforeEach } from 'vitest';
import { page } from 'vitest/browser';
import { isMacOS } from '@/utils/isMacOS.ts';

describe('<clippy-editor>', () => {
  beforeEach(() => {
    document.body.innerHTML =
      '<clippy-editor><div slot="content" hidden><h1>Start met kopniveau 1</h1></div></clippy-editor>';
  });

  it('should change selected text to heading level 3', async () => {
    const user = userEvent.setup();
    const editor = document.querySelector('clippy-editor');
    await editor?.updateComplete;
    await expect.element(page.getByRole('heading', { name: 'Start met kopniveau 1' })).toBeInTheDocument();

    const boldButton = querySelectorDeep('button[aria-label="Bold"]');

    const button = querySelectorDeep('utrecht-button');
    await button?.componentOnReady();

    expect(boldButton).toBeTruthy();
    await userEvent.click(boldButton as HTMLButtonElement);

    const text = page.getByText('Start met kopniveau 1').element();
    expect(text).toBeInTheDocument();

    // Select the text by simulating mouse selection
    await user.pointer([
      { keys: '[MouseLeft>]', target: text },
      { offset: text.textContent?.length, target: text },
      { keys: '[/MouseLeft]' },
    ]);

    const select = querySelectorDeep('select');
    expect(select).toBeTruthy();
    await user.selectOptions(select as Element, 'h3');

    const h3Option = querySelectorDeep('li[role="option"]#h3');
    await user.click(h3Option as Element);

    const h3Text = page.getByRole('heading', { level: 3 });
    expect(h3Text).toHaveTextContent('Start met kopniveau 1');
  });

  it('should open the shortcuts dialog with Command/Control + Alt + T', async () => {
    const user = userEvent.setup();
    const text = page.getByText('Start met kopniveau 1').element();
    expect(text).toBeInTheDocument();
    const button = querySelectorDeep('utrecht-button');
    await button?.componentOnReady();

    await user.click(text);
    if (isMacOS()) {
      await user.keyboard('{meta>}{alt>}{t}{/alt}{/meta}');
    } else {
      await user.keyboard('{control>}{alt>}{t}{/alt}{/control}');
    }
    const a11yDialog = querySelectorDeep('#dialog-content');
    expect(a11yDialog?.hasAttribute('open')).toBe(true);

    expect(a11yDialog?.querySelector('ul li')?.textContent).toBe('Geen toegankelijkheidsfouten gevonden.');
  });
});
