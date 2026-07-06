import './index.ts';
import { describe, it, expect } from 'vitest';
import { page } from 'vitest/browser';

describe('<validation-item>', () => {
  it('renders correctly', async () => {
    document.body.innerHTML = `<clippy-validation-item
        pos="2"
        severity="error"
        description="Beware of the great error!"
        href="https://example.com"
        >
        <div slot="tip-html">This is a <strong>great</strong> tip!</div>
        </clippy-validation-item>`;

    const item = document.querySelector('clippy-validation-item');
    await item?.updateComplete;
    const slotContent = await page.getByText('This is a great tip!');
    await expect.element(slotContent).toBeInTheDocument();

    const heading = await page.getByRole('heading', { name: 'Beware of the great error!' });
    await expect.element(heading).toBeInTheDocument();
  });
});
