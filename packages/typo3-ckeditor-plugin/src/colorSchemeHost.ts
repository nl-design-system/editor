import {
  matchDarkColorScheme,
  observeAttributes,
  resolveDeclaredColorScheme,
  type ColorScheme,
  type ColorSchemeHost,
} from '@nl-design-system-community/ckeditor-plugin';

const COLOR_SCHEME_ATTRIBUTE = 'data-color-scheme';

/**
 * The document element carrying the current backend color scheme.
 *
 * The backend nests iframes (`list_frame`, `modal_frame`), each with its own document, but
 * TYPO3 only writes scheme changes onto the top document and `list_frame`'s. An editor inside
 * a modal would therefore read a stale attribute from its own document, so read the top one
 * instead — falling back to ours when the top frame is cross-origin and inaccessible.
 */
const schemeRoot = (): HTMLElement => {
  try {
    return window.top?.document.documentElement ?? document.documentElement;
  } catch {
    return document.documentElement;
  }
};

/**
 * TYPO3's backend color scheme, as written on the document element since 13.3.
 *
 * The attribute holds the raw setting, so only `dark` and `light` are answers. Everything else —
 * `auto`, or the absent attribute `PageRenderer` renders for `auto` — falls through to what the
 * backend declares in CSS: `light dark` on 13.3+, which resolves against the OS, and nothing at
 * all on versions predating the feature, which resolves to light.
 */
export const typo3ColorSchemeHost: ColorSchemeHost = {
  resolve: (): ColorScheme => {
    const root = schemeRoot();
    const colorScheme = root.getAttribute(COLOR_SCHEME_ATTRIBUTE);
    if (colorScheme === 'dark' || colorScheme === 'light') {
      return colorScheme;
    }
    return resolveDeclaredColorScheme(root);
  },
  subscribe: (_element, onChange) => {
    const stopObserving = observeAttributes(schemeRoot(), [COLOR_SCHEME_ATTRIBUTE], onChange);

    // Under `auto` the attribute stays put while the answer changes with the OS.
    const query = matchDarkColorScheme();
    query?.addEventListener('change', onChange);

    return () => {
      stopObserving();
      query?.removeEventListener('change', onChange);
    };
  },
};
