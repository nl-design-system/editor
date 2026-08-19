export const DARK_COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)';
export const THEME_CLASS = 'ma-theme';
export const DARK_COLOR_SCHEME_CLASS = 'ma-theme--color-scheme-dark';

/** Toggles the dark modifier class on `root` to match the given preference. */
const syncColorScheme = (root: HTMLElement, matches: boolean): void => {
  root.classList.toggle(DARK_COLOR_SCHEME_CLASS, matches);
};

/**
 * Keeps the `ma-theme--color-scheme-dark` modifier class in sync with the
 * user's preferred color scheme.
 *
 * @param root - Element to toggle the class on (defaults to the `.ma-theme` element).
 * @returns The observed `MediaQueryList`.
 */
export const applyColorScheme = (
  root: HTMLElement = document.querySelector<HTMLElement>(`.${THEME_CLASS}`) ?? document.documentElement,
): MediaQueryList => {
  const query = window.matchMedia(DARK_COLOR_SCHEME_QUERY);

  syncColorScheme(root, query.matches);
  query.addEventListener('change', (event) => syncColorScheme(root, event.matches));

  return query;
};
