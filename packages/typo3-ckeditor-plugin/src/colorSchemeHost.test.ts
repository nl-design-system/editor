import { watchHostColorScheme } from '@nl-design-system-community/ckeditor-plugin';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { typo3ColorSchemeHost } from './colorSchemeHost.ts';

const COLOR_SCHEME_ATTRIBUTE = 'data-color-scheme';

const element = (): HTMLElement => document.createElement('div');

const setPrefersDark = (matches: boolean): void => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({ addEventListener: () => {}, matches, media: query, removeEventListener: () => {} })),
  );
};

const styles: HTMLStyleElement[] = [];

/** Declares both schemes on the root the way a 13.3+ backend does, as real CSS. */
const declareBothSchemes = (): void => {
  const style = document.createElement('style');
  style.textContent = ':root { color-scheme: light dark; }';
  document.head.append(style);
  styles.push(style);
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  styles.splice(0).forEach((style) => style.remove());
  document.documentElement.removeAttribute(COLOR_SCHEME_ATTRIBUTE);
});

describe('typo3ColorSchemeHost', () => {
  it('follows data-color-scheme="dark"', () => {
    setPrefersDark(false);
    document.documentElement.setAttribute(COLOR_SCHEME_ATTRIBUTE, 'dark');

    expect(typo3ColorSchemeHost.resolve(element())).toBe('dark');
  });

  it('follows data-color-scheme="light", even when the OS prefers dark', () => {
    setPrefersDark(true);
    document.documentElement.setAttribute(COLOR_SCHEME_ATTRIBUTE, 'light');

    expect(typo3ColorSchemeHost.resolve(element())).toBe('light');
  });

  it('resolves data-color-scheme="auto" against the OS preference', () => {
    setPrefersDark(true);
    declareBothSchemes();
    document.documentElement.setAttribute(COLOR_SCHEME_ATTRIBUTE, 'auto');

    expect(typo3ColorSchemeHost.resolve(element())).toBe('dark');
  });

  it('follows the OS when the attribute is absent, which is how PageRenderer renders auto', () => {
    setPrefersDark(true);
    declareBothSchemes();

    expect(typo3ColorSchemeHost.resolve(element())).toBe('dark');
  });

  it('is light when the attribute is absent and the OS prefers light', () => {
    setPrefersDark(false);
    declareBothSchemes();

    expect(typo3ColorSchemeHost.resolve(element())).toBe('light');
  });

  it('is light on a version with no color scheme at all, even when the OS prefers dark', () => {
    setPrefersDark(true);

    expect(typo3ColorSchemeHost.resolve(element())).toBe('light');
  });

  it('reports when the attribute changes, and stops on teardown', async () => {
    setPrefersDark(false);
    const onChange = vi.fn();
    const stop = typo3ColorSchemeHost.subscribe(element(), onChange);

    document.documentElement.setAttribute(COLOR_SCHEME_ATTRIBUTE, 'dark');
    await vi.waitFor(() => expect(onChange).toHaveBeenCalledOnce());

    stop();
    document.documentElement.setAttribute(COLOR_SCHEME_ATTRIBUTE, 'light');
    await vi.waitFor(() => expect(document.documentElement.getAttribute(COLOR_SCHEME_ATTRIBUTE)).toBe('light'));
    expect(onChange).toHaveBeenCalledOnce();
  });

  it('reports an OS change, which under auto changes the answer without touching the attribute', () => {
    const listeners: (() => void)[] = [];
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({
        addEventListener: (_type: string, listener: () => void) => listeners.push(listener),
        matches: false,
        removeEventListener: () => {},
      })),
    );
    const onChange = vi.fn();

    typo3ColorSchemeHost.subscribe(element(), onChange);
    listeners.forEach((listener) => listener());

    expect(onChange).toHaveBeenCalledOnce();
  });
});

describe('the package entry point', () => {
  it('registers the host as it loads', async () => {
    setPrefersDark(false);
    document.documentElement.setAttribute(COLOR_SCHEME_ATTRIBUTE, 'dark');
    await import('./index.ts');
    const onChange = vi.fn();

    watchHostColorScheme(element(), onChange);

    expect(onChange).toHaveBeenCalledExactlyOnceWith('dark');
  });
});
