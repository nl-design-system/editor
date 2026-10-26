import './index';
import '@/components/alt-text-wizard/button';
import { afterEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { DARK_COLOR_SCHEME_CLASS, THEME_CLASS } from '@/utils/colorScheme';

describe('<clippy-color-scheme-wrapper>', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    document.documentElement.lang = '';
    document.documentElement.classList.remove(THEME_CLASS, DARK_COLOR_SCHEME_CLASS);
  });

  it('styles its children with the Clippy theme outside a themed page', async () => {
    document.documentElement.lang = 'en';
    document.body.innerHTML =
      '<clippy-color-scheme-wrapper><clippy-alt-text-wizard-button></clippy-alt-text-wizard-button></clippy-color-scheme-wrapper>';
    const button = page.getByRole('button', { name: 'Alt-text wizard' });
    await expect.element(button).toBeVisible();

    expect(getComputedStyle(button.element()).paddingInlineStart).not.toBe('0px');
  });

  it('follows the dark color scheme of the theme scope it sits in', async () => {
    document.documentElement.classList.add(THEME_CLASS, DARK_COLOR_SCHEME_CLASS);
    document.body.innerHTML = '<clippy-color-scheme-wrapper></clippy-color-scheme-wrapper>';
    const wrapper = document.querySelector('clippy-color-scheme-wrapper')!;

    expect(wrapper).toHaveClass(DARK_COLOR_SCHEME_CLASS);

    document.documentElement.classList.remove(DARK_COLOR_SCHEME_CLASS);

    await expect.poll(() => wrapper.classList.contains(DARK_COLOR_SCHEME_CLASS)).toBe(false);
  });

  it('stops following the color scheme once removed', async () => {
    document.documentElement.classList.add(THEME_CLASS);
    document.body.innerHTML = '<clippy-color-scheme-wrapper></clippy-color-scheme-wrapper>';
    const wrapper = document.querySelector('clippy-color-scheme-wrapper')!;
    wrapper.remove();

    document.documentElement.classList.add(DARK_COLOR_SCHEME_CLASS);
    await new Promise((resolve) => setTimeout(resolve));

    expect(wrapper).not.toHaveClass(DARK_COLOR_SCHEME_CLASS);
  });
});
