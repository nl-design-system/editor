import './index.ts';
import { describe, it, expect } from 'vitest';
import { page } from 'vitest/browser';

describe('<validation-list-item>', () => {
  it('renders correctly', async () => {
    document.body.innerHTML = `<clippy-validation-list-item
        pos="2"
        severity="error"
        description="Beware of the great error!"
        href="https://example.com"
        >
        <div slot="tip-html">This is a <strong>great</strong> tip!</div>
        </clippy-validation-list-item>`;

    const item = document.querySelector('clippy-validation-list-item');
    await item?.updateComplete;
    const slotContent = await page.getByText('This is a great tip!');
    await expect.element(slotContent).toBeInTheDocument();

    const listItem = await page.getByRole('listitem');
    await expect.element(listItem).toBeInTheDocument();
  });
});
