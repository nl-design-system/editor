import { violation } from '@test/violation';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import type { Violation } from '@/types/validation';
import { CustomEvents, type OpenValidationGroupDetail } from '@/events';
import './index';
import type { ValidationToggle } from './index';

const entry = (severity: Violation['severity'], title: string): [Range, Violation] => {
  const range = document.createRange();
  return [range, violation({ messages: { title }, range, severity })];
};

const createToggle = async (entries: [Range, Violation][]): Promise<ValidationToggle> => {
  const toggle = document.createElement('clippy-validation-toggle');
  toggle.identifier = 'editor';
  toggle.entries = entries;
  document.body.replaceChildren(toggle);
  await toggle.updateComplete;
  return toggle;
};

describe('<clippy-validation-toggle>', () => {
  beforeEach(() => {
    document.documentElement.lang = 'nl';
  });

  afterEach(() => {
    document.body.replaceChildren();
  });

  it('is a button named after a single validation', async () => {
    await createToggle([entry('warning', 'Kop heeft geen inhoud.')]);

    await expect
      .element(page.getByRole('button', { name: "Validatiemelding 'Kop heeft geen inhoud' openen" }))
      .toBeVisible();
  });

  it('names the number of validations and shows it in a badge when there are several', async () => {
    const toggle = await createToggle([entry('warning', 'Eerste.'), entry('error', 'Tweede.')]);

    await expect.element(page.getByRole('button', { name: '2 validatiemeldingen openen' })).toBeVisible();
    expect(toggle.shadowRoot!.querySelector('.clippy-validation-toggle__badge')?.textContent?.trim()).toBe('2');
  });

  it('shows the highest severity', async () => {
    const toggle = await createToggle([entry('info', 'Tip.'), entry('error', 'Fout.'), entry('warning', 'Let op.')]);

    expect(toggle.shadowRoot!.querySelector('button')).toHaveClass('clippy-validation-toggle--error');
  });

  it('renders nothing without validations', async () => {
    const toggle = await createToggle([]);

    expect(toggle.shadowRoot!.querySelector('button')).toBeNull();
  });

  it('opens its validations in the validations sidebar of its hub', async () => {
    const entries = [entry('warning', 'Eerste.'), entry('error', 'Tweede.')];
    await createToggle(entries);
    const details: OpenValidationGroupDetail[] = [];
    const record = (event: Event) => details.push((event as CustomEvent<OpenValidationGroupDetail>).detail);
    globalThis.addEventListener(CustomEvents.OPEN_VALIDATION_GROUP, record);

    await userEvent.click(page.getByRole('button'));

    globalThis.removeEventListener(CustomEvents.OPEN_VALIDATION_GROUP, record);
    expect(details).toEqual([{ identifier: 'editor', ranges: entries.map(([range]) => range) }]);
  });
});
