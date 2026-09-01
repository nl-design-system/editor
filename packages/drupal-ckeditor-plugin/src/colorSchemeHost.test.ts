import { watchHostColorScheme } from '@nl-design-system-community/ckeditor-plugin';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { drupalColorSchemeHost } from './colorSchemeHost.ts';

const GIN_DARK_CLASS = 'gin--dark-mode';

const element = (): HTMLElement => document.createElement('div');

const setPrefersDark = (matches: boolean): void => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({ addEventListener: () => {}, matches, media: query, removeEventListener: () => {} })),
  );
};

/** Stubs `matchMedia` so the OS preference can be flipped, firing the listeners the host added. */
const stubOsPreference = (matches: boolean) => {
  const listeners: (() => void)[] = [];
  const state = { matches };
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({
      addEventListener: (_type: string, listener: () => void) => listeners.push(listener),
      get matches() {
        return state.matches;
      },
      removeEventListener: (_type: string, listener: () => void) => {
        const index = listeners.indexOf(listener);
        if (index >= 0) {
          listeners.splice(index, 1);
        }
      },
    })),
  );
  return {
    listenerCount: () => listeners.length,
    setMatches: (next: boolean) => {
      state.matches = next;
      listeners.forEach((listener) => listener());
    },
  };
};

const styles: HTMLStyleElement[] = [];

const declare = (css: string): void => {
  const style = document.createElement('style');
  style.textContent = css;
  document.head.append(style);
  styles.push(style);
};

/** The rule Gin ships in `styles/base/_body.scss`, verbatim. */
const declareGin = (): void => declare('.gin--dark-mode { color-scheme: dark; }');

/** Both rules core's `default_admin` ships in `css/base/elements.css`, verbatim. */
const declareDefaultAdmin = (): void =>
  declare('html { color-scheme: light; } .gin--dark-mode { color-scheme: dark; }');

const setOverride = (colorScheme: unknown): void => {
  vi.stubGlobal('drupalSettings', { clippy: { colorScheme } });
};

afterEach(() => {
  vi.unstubAllGlobals();
  styles.splice(0).forEach((style) => style.remove());
  document.documentElement.className = '';
  document.documentElement.removeAttribute('style');
  document.body.innerHTML = '';
});

describe('drupalColorSchemeHost', () => {
  it('is dark under Gin in dark mode', () => {
    setPrefersDark(false);
    declareGin();
    document.documentElement.classList.add(GIN_DARK_CLASS);

    expect(drupalColorSchemeHost.resolve(element())).toBe('dark');
  });

  it('is light under Gin in light mode, even when the OS prefers dark', () => {
    setPrefersDark(true);
    declareGin();

    expect(drupalColorSchemeHost.resolve(element())).toBe('light');
  });

  it("is dark under core's default_admin in dark mode, where a light root is overruled", () => {
    setPrefersDark(false);
    declareDefaultAdmin();
    document.documentElement.classList.add(GIN_DARK_CLASS);

    expect(drupalColorSchemeHost.resolve(element())).toBe('dark');
  });

  it("is light under core's default_admin in light mode, even when the OS prefers dark", () => {
    setPrefersDark(true);
    declareDefaultAdmin();

    expect(drupalColorSchemeHost.resolve(element())).toBe('light');
  });

  it('is light under Claro, which declares no scheme, even when the OS prefers dark', () => {
    setPrefersDark(true);

    expect(drupalColorSchemeHost.resolve(element())).toBe('light');
  });

  it('follows the OS under a theme that declares it renders both schemes', () => {
    declare(':root { color-scheme: light dark; }');

    setPrefersDark(true);
    expect(drupalColorSchemeHost.resolve(element())).toBe('dark');

    setPrefersDark(false);
    expect(drupalColorSchemeHost.resolve(element())).toBe('light');
  });

  it('reports when the dark class is toggled after subscribing, and stops on teardown', async () => {
    setPrefersDark(false);
    declareGin();
    const onChange = vi.fn();
    const stop = drupalColorSchemeHost.subscribe(element(), onChange);

    document.documentElement.classList.add(GIN_DARK_CLASS);
    await vi.waitFor(() => expect(onChange).toHaveBeenCalledOnce());

    stop();
    document.documentElement.classList.remove(GIN_DARK_CLASS);
    await vi.waitFor(() => expect(document.documentElement.classList.contains(GIN_DARK_CLASS)).toBe(false));
    expect(onChange).toHaveBeenCalledOnce();
  });

  it('reports when a theme sets the scheme inline', async () => {
    setPrefersDark(false);
    const onChange = vi.fn();
    drupalColorSchemeHost.subscribe(element(), onChange);

    document.documentElement.setAttribute('style', 'color-scheme: dark');
    await vi.waitFor(() => expect(onChange).toHaveBeenCalledOnce());
  });
});

describe('following the OS where the answer depends on it', () => {
  it('reports an OS change when the override is auto', () => {
    const os = stubOsPreference(false);
    setOverride('auto');
    const onChange = vi.fn();

    watchHostColorScheme(element(), onChange, drupalColorSchemeHost);
    expect(onChange).toHaveBeenCalledExactlyOnceWith('light');

    os.setMatches(true);
    expect(onChange).toHaveBeenLastCalledWith('dark');
  });

  it('reports an OS change under a theme that declares both schemes', () => {
    const os = stubOsPreference(false);
    declare(':root { color-scheme: light dark; }');
    const onChange = vi.fn();

    watchHostColorScheme(element(), onChange, drupalColorSchemeHost);
    expect(onChange).toHaveBeenCalledExactlyOnceWith('light');

    os.setMatches(true);
    expect(onChange).toHaveBeenLastCalledWith('dark');
  });
});

describe('the drupalSettings override', () => {
  it('forces dark on a theme that declares light', () => {
    setPrefersDark(false);
    declareDefaultAdmin();
    setOverride('dark');

    expect(drupalColorSchemeHost.resolve(element())).toBe('dark');
  });

  it('forces light on a theme that declares dark', () => {
    setPrefersDark(true);
    declareGin();
    document.documentElement.classList.add(GIN_DARK_CLASS);
    setOverride('light');

    expect(drupalColorSchemeHost.resolve(element())).toBe('light');
  });

  it('follows the OS when set to auto, on a theme that declares nothing', () => {
    setPrefersDark(true);
    setOverride('auto');

    expect(drupalColorSchemeHost.resolve(element())).toBe('dark');
  });

  it('is ignored when it holds a value that is not a setting', () => {
    setPrefersDark(false);
    declareGin();
    document.documentElement.classList.add(GIN_DARK_CLASS);
    setOverride('nonsense');

    expect(drupalColorSchemeHost.resolve(element())).toBe('dark');
  });

  it('is ignored when drupalSettings is absent altogether', () => {
    setPrefersDark(false);
    declareGin();
    document.documentElement.classList.add(GIN_DARK_CLASS);

    expect(drupalColorSchemeHost.resolve(element())).toBe('dark');
  });
});
