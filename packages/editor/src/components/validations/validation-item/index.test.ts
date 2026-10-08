import './index';
import { describe, it, expect, vi } from 'vitest';
import { page } from 'vitest/browser';
import { CustomEvents } from '@/events';
import type { ValidationItem } from './index';

/** Mounts an item with its properties set directly — `correction` has no attribute form. */
const renderItem = async (
  properties: Partial<Pick<ValidationItem, 'correction' | 'documentationId' | 'heading' | 'solution'>> = {},
): Promise<ValidationItem> => {
  document.body.innerHTML = `<clippy-validation-item pos="1" severity="error" heading="Fout"></clippy-validation-item>`;
  const item = document.querySelector('clippy-validation-item') as ValidationItem;
  Object.assign(item, properties);
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

  it('shows an element name the heading mentions instead of opening a tag', async () => {
    const item = await renderItem({ heading: 'Het <em>-element is leeg.' });

    const heading = item.shadowRoot?.querySelector('h4');
    expect(heading?.textContent).toBe('Het <em>-element is leeg.');
    expect(heading?.querySelector('em')).toBeNull();
  });
});

describe('<validation-item> documentation', () => {
  /** "Hele alinea is dikgedrukt", which offers two alternative solutions beside the main one. */
  const ENTIRELY_BOLD = 'd9c53eaf-16dd-42eb-bcc4-7d9f97283309';

  it('explains the rule and every solution it offers', async () => {
    const item = await renderItem({ documentationId: ENTIRELY_BOLD });

    const paragraphs = [...(item.shadowRoot?.querySelectorAll('.clippy-validation-item__message p') ?? [])];
    expect(paragraphs.map(({ textContent }) => textContent)).toEqual([
      expect.stringContaining('De hele alinea is dikgedrukt.'),
      expect.stringContaining('Wil je een kop toevoegen boven een sectie?'),
      expect.stringContaining('omdat het de introductietekst is?'),
      expect.stringContaining('alleen voor de woorden of zinnen die extra aandacht nodig hebben'),
    ]);
  });

  it('falls back to the validation copy for a rule the documentation does not describe', async () => {
    await renderItem({ solution: 'Verwijder de lege tabelcel.' });

    await expect.element(page.getByText('Verwijder de lege tabelcel.')).toBeInTheDocument();
  });

  it('prefers the documentation over the validation copy', async () => {
    const item = await renderItem({ documentationId: ENTIRELY_BOLD, solution: 'Eigen oplossing.' });

    expect(item.shadowRoot?.textContent).not.toContain('Eigen oplossing.');
  });

  it('lets the host override both through the slot', async () => {
    document.body.innerHTML = `<clippy-validation-item severity="warning" heading="Fout">
        <p slot="solution-html">Eigen uitleg.</p>
        </clippy-validation-item>`;
    const item = document.querySelector('clippy-validation-item') as ValidationItem;
    item.documentationId = ENTIRELY_BOLD;
    await item.updateComplete;

    // The documentation stays in the shadow tree as the slot's fallback, so what counts is which
    // of the two the slot actually assigns.
    const slot = item.shadowRoot?.querySelector('slot[name="solution-html"]') as HTMLSlotElement;
    expect(slot.assignedNodes({ flatten: true }).map(({ textContent }) => textContent)).toEqual(['Eigen uitleg.']);
  });
});

describe('<validation-item> correction', () => {
  it('offers no fix button when there is no correction', async () => {
    const item = await renderItem();

    expect(correctButton(item)).toBeNull();
  });

  it('labels the button "Correct" when the correction does not name one', async () => {
    const item = await renderItem({ correction: { execute: () => {} } });

    expect(correctButton(item)?.textContent?.trim()).toBe('Correct');
  });

  it('uses the label the correction carries', async () => {
    const item = await renderItem({ correction: { execute: () => {}, label: 'Bewerken' } });

    expect(correctButton(item)?.textContent?.trim()).toBe('Bewerken');
  });

  it('runs the correction and announces it when the button is clicked', async () => {
    const execute = vi.fn();
    const announced = vi.fn();
    const item = await renderItem({ correction: { execute } });
    item.addEventListener(CustomEvents.CORRECT_VALIDATION_ISSUE, announced);

    correctButton(item)?.click();

    expect(execute).toHaveBeenCalledOnce();
    expect(announced).toHaveBeenCalledOnce();
  });
});
