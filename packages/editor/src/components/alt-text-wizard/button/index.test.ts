import './index';
import { afterEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

describe('<clippy-alt-text-wizard-button>', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    document.documentElement.lang = '';
  });

  it('is a button named "Alt-text wizard" with an icon', async () => {
    document.documentElement.lang = 'en';
    document.body.innerHTML = '<clippy-alt-text-wizard-button></clippy-alt-text-wizard-button>';

    const button = page.getByRole('button', { name: 'Alt-text wizard' });
    await expect.element(button).toBeVisible();
    const host = document.querySelector('clippy-alt-text-wizard-button')!;
    expect(host.shadowRoot!.querySelector('clippy-icon svg')).not.toBeNull();
  });

  it('is named "Alt-tekst keuzehulp" in a Dutch document', async () => {
    document.documentElement.lang = 'nl-NL';
    document.body.innerHTML = '<clippy-alt-text-wizard-button></clippy-alt-text-wizard-button>';

    await expect.element(page.getByRole('button', { name: 'Alt-tekst keuzehulp' })).toBeVisible();
  });

  it('is styled by the Clippy theme outside a themed page', async () => {
    document.documentElement.lang = 'en';
    document.body.innerHTML = '<clippy-alt-text-wizard-button></clippy-alt-text-wizard-button>';
    const button = page.getByRole('button', { name: 'Alt-text wizard' });
    await expect.element(button).toBeVisible();

    expect(getComputedStyle(button.element()).paddingInlineStart).not.toBe('0px');
  });
});
