import './index';
import { waitFor } from '@testing-library/dom';
import { describe, it, expect, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { CustomEvents } from '@/events';
import type { ValidationItem } from './index';

/** Mounts an item with its properties set directly — `correction` has no attribute form. */
const renderItem = async (
  properties: Partial<Pick<ValidationItem, 'correction' | 'explanation' | 'heading' | 'href' | 'solution'>> = {},
): Promise<ValidationItem> => {
  document.body.innerHTML = `<clippy-validation-item pos="1" severity="error" heading="Fout"></clippy-validation-item>`;
  const item = document.querySelector('clippy-validation-item') as ValidationItem;
  Object.assign(item, properties);
  await item.updateComplete;
  return item;
};

const correctButton = (item: ValidationItem): HTMLElement | null | undefined =>
  item.shadowRoot?.querySelector('clippy-button[purpose="primary"]');

/** Copy as a violation carries it: the heading plain text, explanation and solution as HTML. */
const ENTIRELY_BOLD = {
  explanation: '<p>De hele alinea is dikgedrukt.</p>',
  heading: 'Hele alinea is dikgedrukt',
  solution: '<p>Gebruik dikgedrukt alleen voor de woorden of zinnen die extra aandacht nodig hebben.</p>',
};

const messageText = (item: ValidationItem): string =>
  item.shadowRoot?.querySelector('.clippy-validation-item__message')?.textContent ?? '';

/** A `clippy-button` focuses a button in its own shadow root, which this shadow root reports as the host. */
const focusedButtonLabel = (item: ValidationItem): string => item.shadowRoot?.activeElement?.textContent?.trim() ?? '';

describe('<validation-item>', () => {
  it('renders correctly', async () => {
    document.body.innerHTML = `<clippy-validation-item pos="2" severity="error">
        <div slot="solution-html">This is a <strong>great</strong> tip!</div>
        </clippy-validation-item>`;

    const item = document.querySelector('clippy-validation-item');
    Object.assign(item as ValidationItem, {
      heading: 'Beware of the great error!',
      href: 'https://example.com',
    });
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
  it('explains the rule under the heading, and nothing more', async () => {
    const item = await renderItem({ ...ENTIRELY_BOLD });

    const paragraphs = [...(item.shadowRoot?.querySelectorAll('.clippy-validation-item__message p') ?? [])];
    expect(paragraphs.map(({ textContent }) => textContent)).toEqual([
      expect.stringContaining('De hele alinea is dikgedrukt.'),
    ]);
  });

  it('falls back to the solution for a violation with nothing explained', async () => {
    await renderItem({ solution: '<p>Verwijder de lege tabelcel.</p>' });

    await expect.element(page.getByText('Verwijder de lege tabelcel.')).toBeInTheDocument();
  });

  it('lets the host override both through the slot', async () => {
    document.body.innerHTML = `<clippy-validation-item severity="warning">
        <p slot="solution-html">Eigen uitleg.</p>
        </clippy-validation-item>`;
    const item = document.querySelector('clippy-validation-item') as ValidationItem;
    Object.assign(item, ENTIRELY_BOLD);
    await item.updateComplete;

    // The documentation stays in the shadow tree as the slot's fallback, so what counts is the assignment.
    const slot = item.shadowRoot?.querySelector('slot[name="solution-html"]') as HTMLSlotElement;
    expect(slot.assignedNodes({ flatten: true }).map(({ textContent }) => textContent)).toEqual(['Eigen uitleg.']);
  });
});

describe('<validation-item> solution', () => {
  const solutionLink = () => page.getByRole('button', { name: 'Solution' });
  const backLink = () => page.getByRole('button', { name: 'Back' });

  it('offers no way in for a violation with nothing explained', async () => {
    await renderItem({ solution: '<p>Verwijder de lege tabelcel.</p>' });

    await expect.element(solutionLink()).not.toBeInTheDocument();
  });

  it('shows how to resolve the issue once the link is activated', async () => {
    const item = await renderItem({ ...ENTIRELY_BOLD });

    await userEvent.click(solutionLink());

    const paragraphs = [...(item.shadowRoot?.querySelectorAll('.clippy-validation-item__message p') ?? [])];
    expect(paragraphs.map(({ textContent }) => textContent)).toEqual([
      expect.stringContaining('alleen voor de woorden of zinnen die extra aandacht nodig hebben'),
    ]);
  });

  it('leaves the explanation behind while the solution shows', async () => {
    const item = await renderItem({ ...ENTIRELY_BOLD });

    await userEvent.click(solutionLink());

    expect(messageText(item)).not.toContain('De hele alinea is dikgedrukt.');
  });

  it('goes back to the explanation', async () => {
    const item = await renderItem({ ...ENTIRELY_BOLD });

    await userEvent.click(solutionLink());
    await userEvent.click(backLink());

    expect(messageText(item)).toContain('De hele alinea is dikgedrukt.');
    await expect.element(backLink()).not.toBeInTheDocument();
  });

  it('leaves focus alone when the card first renders', async () => {
    document.body.innerHTML = '<button id="elsewhere">Elders</button>';
    document.querySelector<HTMLButtonElement>('#elsewhere')?.focus();

    const item = document.createElement('clippy-validation-item');
    Object.assign(item, { ...ENTIRELY_BOLD, severity: 'error' });
    document.body.append(item);
    await item.updateComplete;
    // The card hands focus over a promise, so let every pending microtask settle before judging.
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(document.activeElement?.id).toBe('elsewhere');
  });

  it('moves focus to the back button, so the keyboard lands in the solution', async () => {
    const item = await renderItem({ ...ENTIRELY_BOLD });

    await userEvent.click(solutionLink());

    await waitFor(() => expect(focusedButtonLabel(item)).toBe('Back'));
  });

  it('returns focus to the button that opened the solution', async () => {
    const item = await renderItem({ ...ENTIRELY_BOLD });

    await userEvent.click(solutionLink());
    await userEvent.click(backLink());

    await waitFor(() => expect(focusedButtonLabel(item)).toBe('Solution'));
  });

  it('keeps the actions reachable from the solution', async () => {
    await renderItem({ correction: { execute: () => {} }, ...ENTIRELY_BOLD });

    await userEvent.click(solutionLink());

    await expect.element(page.getByRole('button', { name: 'Focus' })).toBeInTheDocument();
  });

  it('shares a line with the link to the criterion', async () => {
    const item = await renderItem({ ...ENTIRELY_BOLD, href: 'https://example.com' });

    const links = item.shadowRoot?.querySelector('.clippy-validation-item__links');
    expect(links?.textContent?.replace(/\s+/g, ' ').trim()).toBe('Solution Extensive explanation');
  });

  it('marks the link to the criterion as leaving the editor', async () => {
    const item = await renderItem({ href: 'https://example.com' });

    const link = item.shadowRoot?.querySelector('a[href="https://example.com"]');
    expect(link?.querySelector('clippy-icon')).not.toBeNull();
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
