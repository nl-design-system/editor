import './index.ts';
import { querySelectorDeep } from 'query-selector-shadow-dom';
import { describe, it, expect } from 'vitest';

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
    expect(querySelectorDeep('[slot="tip-html"]')?.innerHTML).toContain('This is a <strong>great</strong> tip!');
    expect(item).toBeDefined();
  });
});
