import './index.ts';
import { describe, it, expect } from 'vitest';

describe('<validation-list-item>', () => {
  it('renders correctly', async () => {
    document.body.innerHTML = `<clippy-validation-list-item
        pos="2"
        severity="error"
        description="Beware of the great error!"
        href="https://example.com"
        tipHtml="This is a <strong>great</strong> tip!"></clippy-validation-list-item>`;

    const item = document.querySelector('clippy-validation-list-item');
    await item?.updateComplete;
    expect(item?.shadowRoot?.querySelector('[data-test-id="tip-html"]')?.innerHTML).toContain(
      'This is a <strong>great</strong> tip!',
    );
    expect(item).toBeTruthy();
  });
});
