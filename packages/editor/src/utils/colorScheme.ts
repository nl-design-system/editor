export const DARK_COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)';
export const THEME_CLASS = 'ma-theme';
export const DARK_COLOR_SCHEME_CLASS = 'ma-theme--color-scheme-dark';

/** localStorage key holding the user's explicit choice: `'dark'` or `'light'`. */
export const COLOR_SCHEME_STORAGE_KEY = 'ma-color-scheme';

/** A color scheme the user can be in, or has explicitly chosen. */
export type ColorScheme = 'dark' | 'light';

/** The `.ma-theme` element, or the document root when none exists. */
const defaultRoot = (): HTMLElement =>
  document.querySelector<HTMLElement>(`.${THEME_CLASS}`) ?? document.documentElement;

/**
 * The user's explicitly stored color-scheme choice, or `null` when none is
 * stored (in which case the OS `prefers-color-scheme` is followed).
 */
export const getStoredColorScheme = (): ColorScheme | null => {
  try {
    const stored = localStorage.getItem(COLOR_SCHEME_STORAGE_KEY);
    return stored === 'dark' || stored === 'light' ? stored : null;
  } catch {
    return null;
  }
};

/** Whether the dark color scheme is currently applied to `root`. */
export const isDarkColorScheme = (root: HTMLElement = defaultRoot()): boolean =>
  root.classList.contains(DARK_COLOR_SCHEME_CLASS);

/**
 * Toggles the `ma-theme--color-scheme-dark` modifier on `root`.
 *
 * @param dark - Whether to enable the dark scheme.
 * @param options.root - Element to toggle the class on (defaults to the `.ma-theme` element).
 * @param options.persist - Store the choice so it survives reloads (defaults to `true`);
 *   pass `false` when merely reflecting a live OS preference change.
 */
export const setDarkColorScheme = (
  dark: boolean,
  { persist = true, root = defaultRoot() }: { root?: HTMLElement; persist?: boolean } = {},
): void => {
  root.classList.toggle(DARK_COLOR_SCHEME_CLASS, dark);
  if (persist) {
    try {
      localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, dark ? 'dark' : 'light');
    } catch {
      /* localStorage unavailable (e.g. private mode) — the class still applies for this session. */
    }
  }
};

/**
 * Applies the color scheme and keeps it in sync with the user's preference: an
 * explicit stored choice wins, otherwise the OS `prefers-color-scheme` is
 * followed, including live changes.
 *
 * @param root - Element to toggle the class on (defaults to the `.ma-theme` element).
 * @returns The observed `MediaQueryList`, or `undefined` in environments without
 *   `matchMedia` (e.g. server-side rendering or jsdom).
 */
export const applyColorScheme = (root: HTMLElement = defaultRoot()): MediaQueryList | undefined => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return undefined;
  }

  const query = window.matchMedia(DARK_COLOR_SCHEME_QUERY);
  const resolveDark = (): boolean => {
    const stored = getStoredColorScheme();
    return stored === null ? query.matches : stored === 'dark';
  };

  setDarkColorScheme(resolveDark(), { persist: false, root });
  query.addEventListener('change', () => setDarkColorScheme(resolveDark(), { persist: false, root }));

  return query;
};
