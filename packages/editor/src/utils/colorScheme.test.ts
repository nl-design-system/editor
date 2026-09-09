import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  applyColorScheme,
  getStoredColorScheme,
  isDarkColorScheme,
  observeAttributes,
  prefersDarkColorScheme,
  resolveDeclaredColorScheme,
  setColorSchemeHost,
  setDarkColorScheme,
  storeColorScheme,
  storedPreferenceHost,
  themeScopeHost,
  watchHostColorScheme,
  COLOR_SCHEME_STORAGE_KEY,
  DARK_COLOR_SCHEME_CLASS,
  THEME_CLASS,
  type ColorScheme,
  type ColorSchemeHost,
} from './colorScheme';

/** A `MediaQueryList` stand-in whose match can be flipped, firing a real `change` event. */
class MockMediaQueryList extends EventTarget {
  matches: boolean;

  constructor(matches: boolean) {
    super();
    this.matches = matches;
  }

  setMatches(matches: boolean): void {
    this.matches = matches;
    this.dispatchEvent(new Event('change'));
  }
}

const stubMatchMedia = (matches: boolean): MockMediaQueryList => {
  const query = new MockMediaQueryList(matches);
  vi.stubGlobal('matchMedia', () => query as unknown as MediaQueryList);
  return query;
};

/** Teardowns for everything a test adds: elements, styles and live subscriptions. */
const cleanups: (() => void)[] = [];

/** Applies real CSS, so the declared scheme is read through the engine's own cascade. */
const declare = (css: string): void => {
  const style = document.createElement('style');
  style.textContent = css;
  document.head.append(style);
  cleanups.push(() => style.remove());
};

const createElement = (parent: HTMLElement = document.body, className = ''): HTMLElement => {
  const element = document.createElement('div');
  element.className = className;
  parent.append(element);
  cleanups.push(() => element.remove());
  return element;
};

afterEach(() => {
  cleanups.splice(0).forEach((cleanup) => cleanup());
  vi.unstubAllGlobals();
  setColorSchemeHost(themeScopeHost);
  localStorage.removeItem(COLOR_SCHEME_STORAGE_KEY);
  document.documentElement.classList.remove(DARK_COLOR_SCHEME_CLASS);
});

describe('prefersDarkColorScheme', () => {
  it('reads the OS preference', () => {
    stubMatchMedia(true);
    expect(prefersDarkColorScheme()).toBe(true);

    stubMatchMedia(false);
    expect(prefersDarkColorScheme()).toBe(false);
  });

  it('is false when matchMedia is unavailable', () => {
    vi.stubGlobal('matchMedia', undefined);
    expect(prefersDarkColorScheme()).toBe(false);
  });
});

describe('resolveDeclaredColorScheme', () => {
  /** `null` stands for an environment without `matchMedia`. */
  it.each<{ name: string; declaration: string; prefersDark: boolean | null; expected: ColorScheme }>([
    {
      name: 'is dark when the root declares dark',
      declaration: 'color-scheme: dark',
      expected: 'dark',
      prefersDark: false,
    },
    {
      name: 'is light when the root declares light, whatever the OS prefers',
      declaration: 'color-scheme: light',
      expected: 'light',
      prefersDark: true,
    },
    {
      name: 'is light when nothing is declared, whatever the OS prefers',
      declaration: '',
      expected: 'light',
      prefersDark: true,
    },
    {
      name: 'follows the OS when both schemes are declared and the OS prefers dark',
      declaration: 'color-scheme: light dark',
      expected: 'dark',
      prefersDark: true,
    },
    {
      name: 'follows the OS when both schemes are declared and the OS prefers light',
      declaration: 'color-scheme: light dark',
      expected: 'light',
      prefersDark: false,
    },
    {
      name: 'reads a scheme the `only` keyword pins',
      declaration: 'color-scheme: only dark',
      expected: 'dark',
      prefersDark: false,
    },
    {
      name: 'is light when both schemes are declared and matchMedia is unavailable',
      declaration: 'color-scheme: light dark',
      expected: 'light',
      prefersDark: null,
    },
  ])('$name', ({ declaration, expected, prefersDark }) => {
    if (prefersDark === null) {
      vi.stubGlobal('matchMedia', undefined);
    } else {
      stubMatchMedia(prefersDark);
    }
    declare(`.declares { ${declaration} }`);

    expect(resolveDeclaredColorScheme(createElement(document.body, 'declares'))).toBe(expected);
  });

  it('resolves through the cascade, so a more specific dark rule wins over a light root', () => {
    stubMatchMedia(false);
    declare('.root-light { color-scheme: light; } .is-dark { color-scheme: dark; }');

    expect(resolveDeclaredColorScheme(createElement(document.body, 'root-light is-dark'))).toBe('dark');
  });
});

describe('themeScopeHost', () => {
  const resolve = (element: HTMLElement): ColorScheme => themeScopeHost.resolve(element);

  it('is dark when the nearest theme scope carries the dark modifier', () => {
    stubMatchMedia(false);
    const scope = createElement(document.body, `${THEME_CLASS} ${DARK_COLOR_SCHEME_CLASS}`);

    expect(resolve(createElement(scope))).toBe('dark');
  });

  it('is light when the nearest theme scope has no dark modifier, whatever the OS prefers', () => {
    stubMatchMedia(true);
    const scope = createElement(document.body, THEME_CLASS);

    expect(resolve(createElement(scope))).toBe('light');
  });

  it('reads the nearest theme scope, not an outer one', () => {
    stubMatchMedia(false);
    const outer = createElement(document.body, `${THEME_CLASS} ${DARK_COLOR_SCHEME_CLASS}`);
    const inner = createElement(outer, THEME_CLASS);

    expect(resolve(createElement(inner))).toBe('light');
  });

  it('ignores the element itself being a theme scope', () => {
    stubMatchMedia(true);

    expect(resolve(createElement(document.body, THEME_CLASS))).toBe('dark');
  });

  it('falls back to the OS preference without a theme scope', () => {
    stubMatchMedia(true);
    expect(resolve(createElement())).toBe('dark');

    stubMatchMedia(false);
    expect(resolve(createElement())).toBe('light');
  });

  it('is light when matchMedia is unavailable', () => {
    vi.stubGlobal('matchMedia', undefined);

    expect(resolve(createElement())).toBe('light');
  });
});

describe('watchHostColorScheme', () => {
  it('reports the resolved scheme straight away', () => {
    stubMatchMedia(true);
    const onChange = vi.fn();

    cleanups.push(watchHostColorScheme(createElement(), onChange));

    expect(onChange).toHaveBeenCalledExactlyOnceWith('dark');
  });

  it('follows the theme scope when its dark modifier is toggled', async () => {
    stubMatchMedia(false);
    const scope = createElement(document.body, THEME_CLASS);
    const onChange = vi.fn();

    cleanups.push(watchHostColorScheme(createElement(scope), onChange));
    scope.classList.add(DARK_COLOR_SCHEME_CLASS);

    await vi.waitFor(() => expect(onChange).toHaveBeenLastCalledWith('dark'));
  });

  it('follows the OS preference when there is no theme scope', async () => {
    const query = stubMatchMedia(false);
    const onChange = vi.fn();

    cleanups.push(watchHostColorScheme(createElement(), onChange));
    query.setMatches(true);

    await vi.waitFor(() => expect(onChange).toHaveBeenLastCalledWith('dark'));
  });

  it('takes an explicit host over the registered one', () => {
    stubMatchMedia(false);
    storeColorScheme('dark');
    const onChange = vi.fn();

    cleanups.push(watchHostColorScheme(createElement(), onChange, storedPreferenceHost));

    expect(onChange).toHaveBeenCalledExactlyOnceWith('dark');
  });
});

describe('setColorSchemeHost', () => {
  it('hands resolution and subscription to the registered host', () => {
    stubMatchMedia(false);
    let notify = (): void => {};
    let scheme: ColorScheme = 'dark';
    const host: ColorSchemeHost = {
      resolve: () => scheme,
      subscribe: (_element, onChange) => {
        notify = onChange;
        return () => {};
      },
    };
    setColorSchemeHost(host);
    const onChange = vi.fn();

    cleanups.push(watchHostColorScheme(createElement(), onChange));
    expect(onChange).toHaveBeenCalledExactlyOnceWith('dark');

    scheme = 'light';
    notify();
    expect(onChange).toHaveBeenLastCalledWith('light');
  });

  it('does not affect applyColorScheme, which follows the stored preference', () => {
    stubMatchMedia(false);
    setColorSchemeHost({ resolve: () => 'dark', subscribe: () => () => {} });
    const root = createElement();

    cleanups.push(applyColorScheme(undefined, root));

    expect(isDarkColorScheme(root)).toBe(false);
  });
});

describe('applyColorScheme', () => {
  it('follows the OS preference when no choice is stored', async () => {
    const query = stubMatchMedia(false);
    const root = createElement();

    cleanups.push(applyColorScheme(undefined, root));
    expect(isDarkColorScheme(root)).toBe(false);

    query.setMatches(true);
    await vi.waitFor(() => expect(isDarkColorScheme(root)).toBe(true));

    query.setMatches(false);
    await vi.waitFor(() => expect(isDarkColorScheme(root)).toBe(false));
  });

  it('prefers a stored choice over the OS preference and ignores system changes', async () => {
    const query = stubMatchMedia(false);
    storeColorScheme('dark');
    const root = createElement();

    cleanups.push(applyColorScheme(undefined, root));
    expect(isDarkColorScheme(root)).toBe(true);

    query.setMatches(true);
    await vi.waitFor(() => expect(isDarkColorScheme(root)).toBe(true));
  });

  it('reports every scheme it settles on, including a later toggle', async () => {
    stubMatchMedia(false);
    const root = createElement();
    const onChange = vi.fn();

    cleanups.push(applyColorScheme(onChange, root));
    expect(onChange).toHaveBeenCalledExactlyOnceWith('light');

    setDarkColorScheme(true, root);
    storeColorScheme('dark');

    await vi.waitFor(() => expect(onChange).toHaveBeenLastCalledWith('dark'));
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it('appends the modifier to the ma-theme element by default', () => {
    const themed = createElement(document.body, THEME_CLASS);
    stubMatchMedia(true);

    cleanups.push(applyColorScheme());

    expect(isDarkColorScheme(themed)).toBe(true);
    expect(document.documentElement.classList.contains(DARK_COLOR_SCHEME_CLASS)).toBe(false);
  });

  it('falls back to <html> when no ma-theme element exists', () => {
    expect(document.querySelector(`.${THEME_CLASS}`)).toBeNull();
    stubMatchMedia(true);

    cleanups.push(applyColorScheme());

    expect(document.documentElement.classList.contains(DARK_COLOR_SCHEME_CLASS)).toBe(true);
  });

  it('applies light where matchMedia is unavailable and nothing is stored', () => {
    vi.stubGlobal('matchMedia', undefined);
    const root = createElement();
    root.classList.add(DARK_COLOR_SCHEME_CLASS);

    cleanups.push(applyColorScheme(undefined, root));

    expect(isDarkColorScheme(root)).toBe(false);
  });
});

describe('color scheme helpers', () => {
  it('setDarkColorScheme toggles the class without storing anything', () => {
    const root = createElement();

    setDarkColorScheme(true, root);
    expect(isDarkColorScheme(root)).toBe(true);
    expect(getStoredColorScheme()).toBeNull();

    setDarkColorScheme(false, root);
    expect(isDarkColorScheme(root)).toBe(false);
  });

  it('storeColorScheme remembers the choice without touching any class', () => {
    const root = createElement();

    storeColorScheme('dark');

    expect(getStoredColorScheme()).toBe('dark');
    expect(isDarkColorScheme(root)).toBe(false);
  });

  it('getStoredColorScheme ignores unrecognised stored values', () => {
    localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, 'sepia');
    expect(getStoredColorScheme()).toBeNull();
  });
});

describe('observeAttributes', () => {
  it('reports only the listed attributes and stops on teardown', async () => {
    const target = createElement();
    const onChange = vi.fn();

    const stop = observeAttributes(target, ['data-color-scheme'], onChange);
    target.setAttribute('lang', 'nl');
    target.setAttribute('data-color-scheme', 'dark');

    await vi.waitFor(() => expect(onChange).toHaveBeenCalledOnce());

    stop();
    target.setAttribute('data-color-scheme', 'light');

    await vi.waitFor(() => expect(target.getAttribute('data-color-scheme')).toBe('light'));
    expect(onChange).toHaveBeenCalledOnce();
  });
});
