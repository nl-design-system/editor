import './index';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import type { AltTextWizardDialog } from './index';

const firstQuestion = () => page.getByRole('radio').first();

describe('<clippy-alt-text-wizard-dialog>', () => {
  let dialog: AltTextWizardDialog;

  beforeEach(async () => {
    document.documentElement.lang = 'en';
    dialog = document.createElement('clippy-alt-text-wizard-dialog');
    document.body.append(dialog);
    await dialog.updateComplete;
  });

  afterEach(() => {
    document.body.innerHTML = '';
    document.documentElement.lang = '';
  });

  it('is closed until opened', () => {
    expect(page.getByRole('dialog').query()).toBeNull();
  });

  it('opens a dialog titled "Alt-tekst keuzehulp" with the wizard at its first question', async () => {
    await dialog.open();

    await expect.element(page.getByRole('dialog', { name: 'Alt-tekst keuzehulp' })).toBeVisible();
    await expect.element(firstQuestion()).toBeVisible();
  });

  it('is marked as Dutch, with the wizard inside in Dutch, in an English document', async () => {
    await dialog.open();

    expect(dialog).toHaveAttribute('lang', 'nl');
    await expect.element(page.getByRole('button', { name: 'Volgende stap' })).toBeInTheDocument();
  });

  it.each([
    { lang: 'en', nextStep: 'Next step' },
    { lang: 'en-GB', nextStep: 'Next step' },
    { lang: 'nl-BE', nextStep: 'Volgende stap' },
  ])('keeps the language $lang an integrator gave it', async ({ lang, nextStep }) => {
    const integrated = document.createElement('clippy-alt-text-wizard-dialog');
    integrated.lang = lang;
    document.body.append(integrated);

    await integrated.open();

    expect(integrated).toHaveAttribute('lang', lang);
    await expect.element(page.getByRole('button', { name: nextStep })).toBeInTheDocument();
  });

  it('restarts the wizard at its first question every time it opens', async () => {
    await dialog.open();
    await userEvent.click(firstQuestion());
    await userEvent.click(page.getByRole('button', { name: 'Volgende stap' }));
    await expect.element(page.getByRole('radio').first()).not.toHaveAttribute('name', 'informationLost');

    dialog.close();
    await dialog.open();

    await expect.element(page.getByRole('radio').first()).toHaveAttribute('name', 'informationLost');
  });

  it('dispatches close when closed with Escape', async () => {
    const onClose = vi.fn();
    dialog.addEventListener('close', onClose);
    await dialog.open();

    await userEvent.keyboard('{Escape}');

    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('dispatches close when closed with its close button', async () => {
    const onClose = vi.fn();
    dialog.addEventListener('close', onClose);
    await dialog.open();

    await userEvent.click(page.getByRole('dialog').getByRole('button', { name: 'Sluiten' }));

    await vi.waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  });
});
