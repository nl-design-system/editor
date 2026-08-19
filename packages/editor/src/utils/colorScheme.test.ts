import { afterEach, describe, it, expect, vi } from 'vitest';
import {
  applyColorScheme,
  getStoredColorScheme,
  isDarkColorScheme,
  setDarkColorScheme,
  COLOR_SCHEME_STORAGE_KEY,
  DARK_COLOR_SCHEME_CLASS,
  THEME_CLASS,
} from './colorScheme';

/** A `MediaQueryList` stand-in whose match can be flipped, firing a real `change` event. */
class MockMediaQueryList extends EventTarget {
  constructor(public matches: boolean) {
    super();
  }

  setMatches(matches: boolean): void {
    this.matches = matches;
    this.dispatchEvent(Object.assign(new Event('change'), { matches }));
  }
}

/** Makes `window.matchMedia` return `query`, so `applyColorScheme` observes it. */
const stubMatchMedia = (matches: boolean): MockMediaQueryList => {
  const query = new MockMediaQueryList(matches);
  vi.stubGlobal('matchMedia', () => query as unknown as MediaQueryList);
  return query;
};

afterEach(() => {
  vi.unstubAllGlobals();
  // applyColorScheme reads localStorage, so keep tests isolated from each other.
  localStorage.removeItem(COLOR_SCHEME_STORAGE_KEY);
});

describe('applyColorScheme', () => {
  it('follows the OS preference when no choice is stored', () => {
    const root = document.createElement('div');
    const query = stubMatchMedia(false);

    applyColorScheme(root);
    expect(root.classList.contains(DARK_COLOR_SCHEME_CLASS)).toBe(false);

    query.setMatches(true);
    expect(root.classList.contains(DARK_COLOR_SCHEME_CLASS)).toBe(true);

    query.setMatches(false);
    expect(root.classList.contains(DARK_COLOR_SCHEME_CLASS)).toBe(false);
  });

  it('prefers a stored choice over the OS preference and ignores system changes', () => {
    const root = document.createElement('div');
    const query = stubMatchMedia(false); // OS = light
    localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, 'dark'); // explicit choice = dark

    applyColorScheme(root);
    expect(root.classList.contains(DARK_COLOR_SCHEME_CLASS)).toBe(true);

    query.setMatches(true);
    expect(root.classList.contains(DARK_COLOR_SCHEME_CLASS)).toBe(true);
  });

  it('appends the modifier to the ma-theme element by default', () => {
    const themed = document.createElement('div');
    themed.classList.add(THEME_CLASS);
    document.body.appendChild(themed);
    stubMatchMedia(true);

    try {
      applyColorScheme();
      expect(themed.classList.contains(DARK_COLOR_SCHEME_CLASS)).toBe(true);
      expect(document.documentElement.classList.contains(DARK_COLOR_SCHEME_CLASS)).toBe(false);
    } finally {
      themed.remove();
    }
  });

  it('falls back to <html> when no ma-theme element exists', () => {
    expect(document.querySelector(`.${THEME_CLASS}`)).toBeNull();
    stubMatchMedia(true);

    try {
      applyColorScheme();
      expect(document.documentElement.classList.contains(DARK_COLOR_SCHEME_CLASS)).toBe(true);
    } finally {
      document.documentElement.classList.remove(DARK_COLOR_SCHEME_CLASS);
    }
  });

  it('is a no-op when matchMedia is unavailable (e.g. SSR/jsdom)', () => {
    const root = document.createElement('div');
    vi.stubGlobal('matchMedia', undefined);

    expect(applyColorScheme(root)).toBeUndefined();
    expect(root.classList.contains(DARK_COLOR_SCHEME_CLASS)).toBe(false);
  });
});

describe('color scheme helpers', () => {
  it('setDarkColorScheme toggles the class and persists the choice by default', () => {
    const root = document.createElement('div');

    setDarkColorScheme(true, { root });
    expect(root.classList.contains(DARK_COLOR_SCHEME_CLASS)).toBe(true);
    expect(getStoredColorScheme()).toBe('dark');

    setDarkColorScheme(false, { root });
    expect(root.classList.contains(DARK_COLOR_SCHEME_CLASS)).toBe(false);
    expect(getStoredColorScheme()).toBe('light');
  });

  it('setDarkColorScheme with persist:false does not store the choice', () => {
    const root = document.createElement('div');

    setDarkColorScheme(true, { persist: false, root });
    expect(root.classList.contains(DARK_COLOR_SCHEME_CLASS)).toBe(true);
    expect(getStoredColorScheme()).toBeNull();
  });

  it('isDarkColorScheme reflects the current class on the root', () => {
    const root = document.createElement('div');
    expect(isDarkColorScheme(root)).toBe(false);

    root.classList.add(DARK_COLOR_SCHEME_CLASS);
    expect(isDarkColorScheme(root)).toBe(true);
  });

  it('getStoredColorScheme ignores unrecognised stored values', () => {
    localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, 'sepia');
    expect(getStoredColorScheme()).toBeNull();
  });
});
