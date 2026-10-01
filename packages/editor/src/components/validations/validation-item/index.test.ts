import './index';
import { describe, it, expect } from 'vitest';
import { page } from 'vitest/browser';

describe('<validation-item>', () => {
  it('renders correctly', async () => {
    document.body.innerHTML = `<clippy-validation-item
        pos="2"
        severity="error"
        heading="Beware of the great error!"
        href="https://example.com"
        >
        <div slot="solution-html">This is a <strong>great</strong> tip!</div>
        </clippy-validation-item>`;

    const item = document.querySelector('clippy-validation-item');
    await item?.updateComplete;
    const slotContent = await page.getByText('This is a great tip!');
    await expect.element(slotContent).toBeInTheDocument();

    const heading = await page.getByRole('heading', { name: 'Beware of the great error!' });
    await expect.element(heading).toBeInTheDocument();
  });

  it('styles a code span in the heading as code', async () => {
    document.body.innerHTML = `<clippy-validation-item
        pos="1"
        severity="warning"
        heading="Het \`<em>\`-element is leeg."
        ></clippy-validation-item>`;

    const item = document.querySelector('clippy-validation-item');
    await item?.updateComplete;

    const code = item?.shadowRoot?.querySelector('code.nl-code');
    expect(code?.textContent).toBe('<em>');
    // `pre-wrap` comes from the nl-code stylesheet; a bare <code> would be `normal`. Proves the
    // sheet reached the shadow root, rather than only the class landing on the element.
    expect(getComputedStyle(code!).whiteSpace).toBe('pre-wrap');
  });
});
