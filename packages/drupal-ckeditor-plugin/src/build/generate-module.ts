import { appendFileSync, cpSync, copyFileSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { basename, resolve } from 'node:path';

const packageDir = resolve(import.meta.dirname, '../..');
export const moduleOut = resolve(packageDir, 'dist/clippy');
const demoModuleOut = resolve(packageDir, '../../app/drupal/modules/clippy/dist');

const packageRequire = createRequire(resolve(packageDir, 'package.json'));

// TEMP: tokens bundled into the module so the drupal demo is self-contained.
const editorRequire = createRequire(resolve(packageDir, '../editor/package.json'));
const TOKENS_CSS = [
  '@nl-design-system-community/ma-design-tokens/dist/theme.css',
  '@nl-design-system-community/ma-design-tokens/dist/color-scheme-dark/theme.css',
  '@utrecht/design-tokens/dist/theme.css',
  '@nl-design-system-candidate/button-css/button.css',
];

const PAGE_REVIEW_THEME_CSS = [
  editorRequire.resolve('@nl-design-system-community/ma-design-tokens/dist/theme.css'),
  editorRequire.resolve('@utrecht/design-tokens/dist/theme.css'),
  resolve(packageDir, '../editor/theme.css'),
];

interface Manifest {
  name: string;
  version: string;
  license: string;
  repository: unknown;
  publishConfig: Record<string, unknown>;
}

function writePackFiles({ name, version, license, repository, publishConfig }: Manifest): void {
  const { directory: _directory, ...publishSettings } = publishConfig;
  const manifest = { name, version, license, repository, publishConfig: publishSettings };
  writeFileSync(resolve(moduleOut, 'package.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  copyFileSync(resolve(packageDir, 'README.md'), resolve(moduleOut, 'README.md'));
}

export function generateModule(): void {
  const manifest = JSON.parse(readFileSync(resolve(packageDir, 'package.json'), 'utf8')) as Manifest;
  mkdirSync(moduleOut, { recursive: true });
  // The Drupal module itself (info/libraries/plugin YAML, PHP, config schema).
  cpSync(resolve(packageDir, 'module'), moduleOut, {
    recursive: true,
    filter: (source) => !basename(source).startsWith('.'),
  });
  appendFileSync(resolve(moduleOut, 'clippy.info.yml'), `version: '${manifest.version}'\n`);

  // Ship the editor's clippy theme tokens (--clippy-*) as the module stylesheet.
  copyFileSync(resolve(packageDir, '../editor/theme.css'), resolve(moduleOut, 'clippy.css'));

  // TEMP - inject tokens from --basis / --utrecht --nl; to be discussed
  const tokenString = TOKENS_CSS.map((spec) => readFileSync(editorRequire.resolve(spec), 'utf8')).join('\n');
  writeFileSync(resolve(moduleOut, 'clippy-tokens.css'), tokenString);

  copyFileSync(
    packageRequire.resolve('@nl-design-system-community/editor/page-review'),
    resolve(moduleOut, 'page-review.js'),
  );
  const pageReviewCss = PAGE_REVIEW_THEME_CSS.map((path) => readFileSync(path, 'utf8')).join('\n');
  writeFileSync(resolve(moduleOut, 'clippy-page-review.css'), pageReviewCss);

  rmSync(demoModuleOut, { recursive: true, force: true });
  cpSync(moduleOut, demoModuleOut, { recursive: true });

  writePackFiles(manifest);
}
