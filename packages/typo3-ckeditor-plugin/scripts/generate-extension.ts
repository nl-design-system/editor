import { cpSync, copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { stringify } from 'yaml';

const packageDir = resolve(import.meta.dirname, '..');
export const extensionOut = resolve(packageDir, '../../app/typo3/packages/clippy/dist');

const cssOut = resolve(extensionOut, 'Resources/Public/Css');
const setOut = resolve(extensionOut, 'Configuration/Sets/Clippy');

const SETTING_PREFIX = 'clippy.contentClasses';
const SETTING_CATEGORY = 'contentClasses';
const CATEGORY_LABEL = 'Content classes';
const CATEGORY_DESCRIPTION =
  'Added to the HTML this editor produces. The defaults match the NL Design System. Leave a field empty to output that element without a class.';

const GENERATED = '# Generated from @nl-design-system-community/ckeditor-plugin/content-classes.json - do not edit.';

interface ContentClassesJson {
  fields: { defaultValue: string; description: string; key: string; label: string }[];
}

const packageRequire = createRequire(resolve(packageDir, 'package.json'));

// TEMP: tokens bundled into the extension so the typo3 demo is self-contained.
const editorRequire = createRequire(resolve(packageDir, '../editor/package.json'));
const TOKENS_CSS = [
  '@nl-design-system-community/ma-design-tokens/dist/theme.css',
  '@nl-design-system-community/ma-design-tokens/dist/color-scheme-dark/theme.css',
  '@utrecht/design-tokens/dist/theme.css',
  '@nl-design-system-candidate/button-css/button.css',
];

const writeYaml = (path: string, value: unknown): void =>
  writeFileSync(path, `${GENERATED}\n${stringify(value, { lineWidth: 0 })}`);

const readContentClasses = (): ContentClassesJson =>
  JSON.parse(
    readFileSync(packageRequire.resolve('@nl-design-system-community/ckeditor-plugin/content-classes.json'), 'utf8'),
  ) as ContentClassesJson;

function writeStyles(): void {
  mkdirSync(cssOut, { recursive: true });
  // Ship the editor's clippy theme tokens (--clippy-*) as the extension stylesheet.
  copyFileSync(resolve(packageDir, '../editor/theme.css'), resolve(cssOut, 'clippy.css'));

  // TEMP - inject tokens from --basis / --utrecht --nl; to be discussed
  const tokenString = TOKENS_CSS.map((spec) => readFileSync(editorRequire.resolve(spec), 'utf8')).join('\n');
  writeFileSync(resolve(cssOut, 'clippy-tokens.css'), tokenString);
}

// TYPO3 has no settings form to read content-classes.json at runtime, so the defaults are
// generated into a preset Clippy.yaml imports.
function writePreset(fields: ContentClassesJson['fields']): void {
  writeYaml(resolve(extensionOut, 'Configuration/RTE/ContentClasses.yaml'), {
    editor: { config: { contentClasses: Object.fromEntries(fields.map((f) => [f.key, f.defaultValue])) } },
  });
}

// The same defaults again as site settings, so an admin can override them per site in the
// backend. The set's page.tsconfig wins over the preset above; without the set nothing changes.
function writeSet(fields: ContentClassesJson['fields']): void {
  writeYaml(resolve(setOut, 'settings.definitions.yaml'), {
    categories: { [SETTING_CATEGORY]: { description: CATEGORY_DESCRIPTION, label: CATEGORY_LABEL } },
    settings: Object.fromEntries(
      fields.map(({ defaultValue, description, key, label }) => [
        `${SETTING_PREFIX}.${key}`,
        { category: SETTING_CATEGORY, default: defaultValue, description, label, type: 'string' },
      ]),
    ),
  });

  writeFileSync(
    resolve(setOut, 'page.tsconfig'),
    [
      GENERATED,
      ...fields.map(({ key }) => `RTE.default.editor.config.contentClasses.${key} = {$${SETTING_PREFIX}.${key}}`),
      '',
    ].join('\n'),
  );
}

export function generateExtension(): void {
  // The TYPO3 extension itself (composer.json, RTE preset, import map, page TSconfig, shim).
  cpSync(resolve(packageDir, 'extension'), extensionOut, { recursive: true });

  writeStyles();

  const { fields } = readContentClasses();
  writePreset(fields);
  writeSet(fields);
}
