import userEvent from '@testing-library/user-event';
import { page } from '@vitest/browser/context';
import './ClippyEditor.ts';
import { describe, it, expect, beforeEach } from 'vitest';

describe('<clippy-editor>', () => {
  beforeEach(() => {
    document.body.innerHTML = '<clippy-editor></clippy-editor>';
  });

  it('should change selected text to heading level 3', async () => {
    const user = userEvent.setup();
    await expect.element(page.getByText('NL Design System Editor kop 1')).toBeInTheDocument();

    const h1Button = document
      .querySelector('clippy-editor')
      ?.shadowRoot?.querySelector('clippy-toolbar')
      ?.shadowRoot?.querySelector('clippy-toolbar-button')
      ?.shadowRoot?.querySelector('button');

    expect(h1Button).toBeTruthy();
    await userEvent.click(h1Button as HTMLButtonElement);

    const text = page.getByText('NL Design System Editor kop 1').element();
    expect(text).toBeInTheDocument();

    // Select the text by simulating mouse selection
    await user.pointer([
      { keys: '[MouseLeft>]', target: text },
      { offset: text.textContent?.length, target: text },
      { keys: '[/MouseLeft]' },
    ]);
    const button = page.getByRole('button', { name: 'Heading level 3' });

    await userEvent.click(button.element());

    const h3Text = page.getByRole('heading', { level: 3 });
    expect(h3Text).toHaveTextContent('NL Design System Editor kop 1');
  });
});
