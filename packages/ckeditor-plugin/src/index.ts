export { ClippyPlugin } from './plugin/ClippyPlugin.ts';
export { ContentClasses } from './plugin/ContentClasses.ts';
export type { ValidationResult, ValidationSeverity } from '@nl-design-system-community/editor/validators';
// Re-exported so integration packages register into the same module instance this bundle inlines.
export {
  DARK_COLOR_SCHEME_CLASS,
  THEME_CLASS,
  matchDarkColorScheme,
  observeAttributes,
  prefersDarkColorScheme,
  resolveDeclaredColorScheme,
  setColorSchemeHost,
  themeScopeHost,
  watchHostColorScheme,
} from '@nl-design-system-community/editor/color-scheme';
export type { ColorScheme, ColorSchemeHost } from '@nl-design-system-community/editor/color-scheme';
