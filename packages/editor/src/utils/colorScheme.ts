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
 * The OS dark-scheme query, or `null` where `matchMedia` is unavailable
 * (server-side rendering, jsdom without a stub).
 */
export const matchDarkColorScheme = (): MediaQueryList | null =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia(DARK_COLOR_SCHEME_QUERY)
    : null;

export const prefersDarkColorScheme = (): boolean => matchDarkColorScheme()?.matches ?? false;

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

export const storeColorScheme = (colorScheme: ColorScheme): void => {
  try {
    localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, colorScheme);
  } catch {
    /* localStorage unavailable (e.g. private mode) — class still applies for this session. */
  }
};

/** Whether the dark color scheme is currently applied to `root`. */
export const isDarkColorScheme = (root: HTMLElement = defaultRoot()): boolean =>
  root.classList.contains(DARK_COLOR_SCHEME_CLASS);

/** Toggles the dark color scheme modifier on `root`. */
export const setDarkColorScheme = (dark: boolean, root: HTMLElement = defaultRoot()): void => {
  root.classList.toggle(DARK_COLOR_SCHEME_CLASS, dark);
};

/**
 * `light dark` is a page saying it renders both and defers to the OS, so the OS decides.
 * Declaring nothing resolves to `light`: a theme that has not opted in renders light only.
 */
export const resolveDeclaredColorScheme = (root: HTMLElement): ColorScheme => {
  const declared = root.ownerDocument.defaultView?.getComputedStyle(root).colorScheme ?? '';
  const dark = declared.includes('dark');
  const light = declared.includes('light');

  if (dark && !light) {
    return 'dark';
  }
  if (dark && light) {
    return prefersDarkColorScheme() ? 'dark' : 'light';
  }
  return 'light';
};

/** The page an editor is embedded in, as far as the color scheme is concerned. */
export interface ColorSchemeHost {
  /** The scheme the page around `element` has settled on. */
  resolve(element: HTMLElement): ColorScheme;
  /** Calls `onChange` whenever that answer might have changed. Returns a teardown. */
  subscribe(element: HTMLElement, onChange: () => void): () => void;
}

export const observeAttributes = (target: Element, attributeFilter: string[], onChange: () => void): (() => void) => {
  const observer = new MutationObserver(onChange);
  observer.observe(target, { attributeFilter });
  return () => observer.disconnect();
};

/** Subscribes to OS preference changes. A no-op teardown where `matchMedia` is unavailable. */
const subscribeToOsPreference = (onChange: () => void): (() => void) => {
  const query = matchDarkColorScheme();
  if (!query) {
    return () => {};
  }
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
};

const themeScopeOf = (element: HTMLElement): HTMLElement | null =>
  element.parentElement?.closest<HTMLElement>(`.${THEME_CLASS}`) ?? null;

/**
 * The host used when nothing else is registered: the surrounding theme scope, or the
 * OS preference when the editor sits outside one.
 */
export const themeScopeHost: ColorSchemeHost = {
  resolve: (element) => {
    const scope = themeScopeOf(element);
    if (scope) {
      return scope.classList.contains(DARK_COLOR_SCHEME_CLASS) ? 'dark' : 'light';
    }
    return prefersDarkColorScheme() ? 'dark' : 'light';
  },
  subscribe: (element, onChange) => {
    const scope = themeScopeOf(element);
    return scope ? observeAttributes(scope, ['class'], onChange) : subscribeToOsPreference(onChange);
  },
};

/**
 * The host the standalone app follows: the user's own stored choice, falling back to the
 * OS preference.
 */
export const storedPreferenceHost: ColorSchemeHost = {
  resolve: () => getStoredColorScheme() ?? (prefersDarkColorScheme() ? 'dark' : 'light'),
  subscribe: (element, onChange) => {
    const stopObserving = observeAttributes(element, ['class'], onChange);
    const stopListening = subscribeToOsPreference(onChange);
    return () => {
      stopObserving();
      stopListening();
    };
  },
};

let registeredHost: ColorSchemeHost = themeScopeHost;

export const setColorSchemeHost = (host: ColorSchemeHost): void => {
  registeredHost = host;
};

/**
 * Applies the host's color scheme to `element` and keeps it in sync.
 *
 * `onChange` is called immediately with the resolved scheme, then again on every change
 * to it — never twice with the same value.
 *
 * @param host - Defaults to the host registered for this page.
 * @returns A teardown that unsubscribes from the host.
 */
export const watchHostColorScheme = (
  element: HTMLElement,
  onChange: (colorScheme: ColorScheme) => void,
  host: ColorSchemeHost = registeredHost,
): (() => void) => {
  let current = host.resolve(element);
  onChange(current);

  return host.subscribe(element, () => {
    const next = host.resolve(element);
    if (next !== current) {
      current = next;
      onChange(next);
    }
  });
};

/**
 * Applies the user's own color scheme to `root` and keeps it in sync.
 *
 * @param onChange - Called with every scheme the app settles on, after the class is applied.
 * @returns A teardown that stops following the preference.
 */
export const applyColorScheme = (
  onChange?: (colorScheme: ColorScheme) => void,
  root: HTMLElement = defaultRoot(),
): (() => void) =>
  watchHostColorScheme(
    root,
    (colorScheme) => {
      setDarkColorScheme(colorScheme === 'dark', root);
      onChange?.(colorScheme);
    },
    storedPreferenceHost,
  );
