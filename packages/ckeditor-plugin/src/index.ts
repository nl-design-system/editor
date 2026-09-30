export { ClippyPlugin } from './plugin/ClippyPlugin.ts';
export { ContentClasses } from './plugin/ContentClasses.ts';
export { createReportPanel } from './plugin/reportPanel.ts';
export type { ReportPanel } from './plugin/reportPanel.ts';
export type { ValidationResult, ValidationSeverity } from '@nl-design-system-community/editor/validators';
export { coreValidationRules, coreValidations } from '@nl-design-system-community/clippy-a11y-validator';
// Re-exported so integration packages register into the same module instance this bundle inlines.
export { ClippyDocument, getClippyDocument, registerHeadingSource } from '@nl-design-system-community/editor/document';
export type {
  DocumentViolation,
  HeadingLevel,
  RegisteredProxySource,
} from '@nl-design-system-community/editor/document';
export type { Panel } from '@nl-design-system-community/editor/panel';
export {
  DARK_COLOR_SCHEME_CLASS,
  THEME_CLASS,
  matchDarkColorScheme,
  observeAttributes,
  prefersDarkColorScheme,
  resolveDeclaredColorScheme,
  setColorSchemeHost,
  setDarkColorScheme,
  themeScopeHost,
  watchHostColorScheme,
} from '@nl-design-system-community/editor/color-scheme';
export type { ColorScheme, ColorSchemeHost } from '@nl-design-system-community/editor/color-scheme';
