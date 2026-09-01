import {
  matchDarkColorScheme,
  observeAttributes,
  prefersDarkColorScheme,
  resolveDeclaredColorScheme,
  type ColorScheme,
  type ColorSchemeHost,
} from '@nl-design-system-community/ckeditor-plugin';

interface DrupalSettingsWindow {
  drupalSettings?: { clippy?: { colorScheme?: unknown } };
}

/**
 * The scheme a site has pinned in `drupalSettings.clippy.colorScheme`, or `null` when it has not.
 *
 * The escape hatch for an admin theme that declares the wrong scheme, or none at all. It wins over
 * the declared scheme rather than filling in for it, because a theme that declares wrongly cannot
 * be corrected by a fallback.
 */
const overriddenColorScheme = (): ColorScheme | null => {
  const setting = (window as unknown as DrupalSettingsWindow).drupalSettings?.clippy?.colorScheme;
  if (setting === 'dark' || setting === 'light') {
    return setting;
  }
  if (setting === 'auto') {
    return prefersDarkColorScheme() ? 'dark' : 'light';
  }
  return null;
};

/**
 * Drupal's color scheme, as the active admin theme declares it in CSS.
 *
 * Reading the declared `color-scheme` rather than a theme's own marker class covers every admin
 * theme that supports dark mode, because declaring it is what makes native controls and scrollbars
 * render correctly.
 */
export const drupalColorSchemeHost: ColorSchemeHost = {
  resolve: () => overriddenColorScheme() ?? resolveDeclaredColorScheme(document.documentElement),
  subscribe: (_element, onChange) => {
    const stopObserving = observeAttributes(document.documentElement, ['class', 'style'], onChange);

    const query = matchDarkColorScheme();
    query?.addEventListener('change', onChange);

    return () => {
      stopObserving();
      query?.removeEventListener('change', onChange);
    };
  },
};
