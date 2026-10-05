import './index';
import type { ViolationCorrection } from '@nl-design-system-community/clippy-a11y-validator';
import { describe, it, expect, vi } from 'vitest';
import { page } from 'vitest/browser';
import { CustomEvents } from '@/events';
import type { ValidationItem } from './index';

/** Mounts an item with a correction set as a property — `correction` has no attribute form. */
const renderItem = async (correction?: ViolationCorrection): Promise<ValidationItem> => {
  document.body.innerHTML = `<clippy-validation-item pos="1" severity="error" heading="Fout"></clippy-validation-item>`;
  const item = document.querySelector('clippy-validation-item') as ValidationItem;
  if (correction) item.correction = correction;
  await item.updateComplete;
  return item;
};

const correctButton = (item: ValidationItem): HTMLElement | null | undefined =>
  item.shadowRoot?.querySelector('clippy-button[purpose="primary"]');

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

describe('<validation-item> correction', () => {
  it('offers no fix button when there is no correction', async () => {
    const item = await renderItem();

    expect(correctButton(item)).toBeNull();
  });

  it('labels the button "Correct" when the correction does not name one', async () => {
    const item = await renderItem({ execute: () => {} });

    expect(correctButton(item)?.textContent?.trim()).toBe('Correct');
  });

  it('uses the label the correction carries', async () => {
    const item = await renderItem({ execute: () => {}, label: 'Bewerken' });

    expect(correctButton(item)?.textContent?.trim()).toBe('Bewerken');
  });

  it('runs the correction and announces it when the button is clicked', async () => {
    const execute = vi.fn();
    const announced = vi.fn();
    const item = await renderItem({ execute });
    item.addEventListener(CustomEvents.CORRECT_VALIDATION_ISSUE, announced);

    correctButton(item)?.click();

    expect(execute).toHaveBeenCalledOnce();
    expect(announced).toHaveBeenCalledOnce();
  });
});
