import userEvent from '@testing-library/user-event';
import { page } from '@vitest/browser/context';
import './index.ts';
import { querySelectorDeep } from 'query-selector-shadow-dom';
import { describe, it, expect, beforeEach } from 'vitest';

describe('<clippy-editor>', () => {
  beforeEach(() => {
    document.body.innerHTML = '<clippy-editor></clippy-editor>';
  });

  it('should change selected text to heading level 3', async () => {
    const user = userEvent.setup();
    await expect.element(page.getByText('Start met kopniveau 1')).toBeInTheDocument();

    const boldButton = querySelectorDeep('button[aria-label="Bold"]');

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

    // find the combobox input inside shadow DOM and type "kopniveau 3" + Enter
    const comboInput = querySelectorDeep('input[name="clippy-combo-box"]');
    expect(comboInput).toBeTruthy();
    await user.click(comboInput as Element);

    await user.type(comboInput as HTMLInputElement, '{Backspace}3');
    const h3Option = querySelectorDeep('li[role="option"]#h3');
    await user.click(h3Option as Element);

    const h3Text = page.getByRole('heading', { level: 3 });
    expect(h3Text).toHaveTextContent('Start met kopniveau 1');
  });
});
