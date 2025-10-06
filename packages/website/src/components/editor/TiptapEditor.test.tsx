import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import TiptapEditor from './TiptapEditor';

describe('<TiptapEditor />', () => {
  it('should change selected text to heading level 3', async () => {
    const user = userEvent.setup();
    const { getByRole, getByText } = render(<TiptapEditor />);
    await expect.element(getByText('NL Design System Editor kop 1')).toBeInTheDocument();

    const text = getByText('NL Design System Editor kop 1');
    expect(text).toBeInTheDocument();

    // Select the text by simulating mouse selection
    await user.pointer([
      { keys: '[MouseLeft>]', target: text },
      { offset: text.textContent?.length, target: text },
      { keys: '[/MouseLeft]' },
    ]);

    const button = getByRole('button', { name: 'Heading level 3' });
    await userEvent.click(button);

    const h3Text = getByRole('heading', { level: 3 });
    expect(h3Text).toHaveTextContent('NL Design System Editor kop 1');
  });
});
