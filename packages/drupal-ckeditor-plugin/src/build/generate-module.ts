import { appendFileSync, cpSync, copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

const packageDir = resolve(import.meta.dirname, '../..');
export const moduleOut = resolve(packageDir, '../../app/drupal/modules/clippy/dist');

const packageRequire = createRequire(resolve(packageDir, 'package.json'));

// TEMP: tokens bundled into the module so the drupal demo is self-contained.
const editorRequire = createRequire(resolve(packageDir, '../editor/package.json'));
const TOKENS_CSS = [
  '@nl-design-system-community/ma-design-tokens/dist/theme.css',
  '@nl-design-system-community/ma-design-tokens/dist/color-scheme-dark/theme.css',
  '@utrecht/design-tokens/dist/theme.css',
  '@nl-design-system-candidate/button-css/button.css',
];

export const packageVersion = (): string =>
  (JSON.parse(readFileSync(resolve(packageDir, 'package.json'), 'utf8')) as { version: string }).version;

export function generateModule(): void {
  mkdirSync(moduleOut, { recursive: true });
  // The Drupal module itself (info/libraries/plugin YAML, PHP, config schema).
  cpSync(resolve(packageDir, 'module'), moduleOut, { recursive: true });
  appendFileSync(resolve(moduleOut, 'clippy.info.yml'), `version: '${packageVersion()}'\n`);

  // The editable content classes, so the PHP settings form and plugin share defaults
  copyFileSync(
    packageRequire.resolve('@nl-design-system-community/ckeditor-plugin/content-classes.json'),
    resolve(moduleOut, 'content-classes.json'),
  );
  // Ship the editor's clippy theme tokens (--clippy-*) as the module stylesheet.
  copyFileSync(resolve(packageDir, '../editor/theme.css'), resolve(moduleOut, 'clippy.css'));

  // TEMP - inject tokens from --basis / --utrecht --nl; to be discussed
  const tokenString = TOKENS_CSS.map((spec) => readFileSync(editorRequire.resolve(spec), 'utf8')).join('\n');
  writeFileSync(resolve(moduleOut, 'clippy-tokens.css'), tokenString);
}
