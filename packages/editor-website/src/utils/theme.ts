/**
 * Client-side helpers for the persistent color-scheme toggle.
 *
 * The scheme is stored as an explicit user choice in `localStorage`; when no
 * choice is stored the site follows the OS `prefers-color-scheme`. The dark
 * modifier is toggled on the document root so the `ma-design-tokens` dark theme
 * (scoped to `.ma-theme--color-scheme-dark`) takes effect for the whole page.
 *
 * NOTE: the pre-paint `is:inline` script in `document.astro` intentionally
 * duplicates these two literals — inline scripts cannot import modules, and it
 * must run before first paint to avoid a flash of the wrong theme.
 */

/** localStorage key holding the user's explicit choice: `'dark'` or `'light'`. */
export const COLOR_SCHEME_STORAGE_KEY = 'ma-color-scheme';

/** Modifier class the `ma-design-tokens` dark theme is scoped to. */
export const DARK_COLOR_SCHEME_CLASS = 'ma-theme--color-scheme-dark';

/** Whether the dark color scheme is currently applied to the document root. */
export const isDarkColorScheme = (): boolean => document.documentElement.classList.contains(DARK_COLOR_SCHEME_CLASS);

/** True while the user has not made an explicit choice, so the OS preference is followed. */
export const hasStoredColorScheme = (): boolean => localStorage.getItem(COLOR_SCHEME_STORAGE_KEY) !== null;

/**
 * Apply the dark (or light) color scheme to the document root.
 *
 * @param dark - Whether to enable the dark scheme.
 * @param persist - Store the choice so it survives reloads (defaults to `true`).
 *   Pass `false` when merely reflecting a live OS preference change.
 */
export const setDarkColorScheme = (dark: boolean, persist = true): void => {
  document.documentElement.classList.toggle(DARK_COLOR_SCHEME_CLASS, dark);
  if (persist) {
    localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, dark ? 'dark' : 'light');
  }
};
