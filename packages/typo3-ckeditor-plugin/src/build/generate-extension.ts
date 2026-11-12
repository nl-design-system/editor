import { cpSync, copyFileSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { basename, resolve } from 'node:path';

const packageDir = resolve(import.meta.dirname, '../..');
export const extensionOut = resolve(packageDir, 'dist/clippy');
const demoExtensionOut = resolve(packageDir, '../../app/typo3/packages/clippy/dist');

const cssOut = resolve(extensionOut, 'Resources/Public/Css');
const pageReviewOut = resolve(extensionOut, 'Resources/Public/PageReview');

const TYPO3_VERSIONS = '12.4.0-14.99.99';

interface ExtensionComposerJson {
  description: string;
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

const phpString = (value: string): string =>
  `'${value.replaceAll('\\', String.raw`\\`).replaceAll("'", String.raw`\'`)}'`;

function writeStyles(): void {
  mkdirSync(cssOut, { recursive: true });
  // Ship the editor's clippy theme tokens (--clippy-*) as the extension stylesheet.
  copyFileSync(resolve(packageDir, '../editor/theme.css'), resolve(cssOut, 'clippy.css'));

  // TEMP - inject tokens from --basis / --utrecht --nl; to be discussed
  const tokenString = TOKENS_CSS.map((spec) => readFileSync(editorRequire.resolve(spec), 'utf8')).join('\n');
  writeFileSync(resolve(cssOut, 'clippy-tokens.css'), tokenString);
}

function writePageReview(): void {
  mkdirSync(pageReviewOut, { recursive: true });
  copyFileSync(
    packageRequire.resolve('@nl-design-system-community/editor/page-review'),
    resolve(pageReviewOut, 'page-review.js'),
  );
  const pageReviewCss = PAGE_REVIEW_THEME_CSS.map((path) => readFileSync(path, 'utf8')).join('\n');
  writeFileSync(resolve(pageReviewOut, 'clippy-page-review.css'), pageReviewCss);
}

// The Extension Manager reads ext_emconf.php instead of composer.json, so both carry the version.
function writeMetadata(version: string): void {
  const composerPath = resolve(extensionOut, 'composer.json');
  const composer = JSON.parse(readFileSync(composerPath, 'utf8')) as ExtensionComposerJson;
  writeFileSync(composerPath, `${JSON.stringify({ ...composer, version }, null, 2)}\n`);

  writeFileSync(
    resolve(extensionOut, 'ext_emconf.php'),
    `<?php

$EM_CONF[$_EXTKEY] = [
    'title' => 'Clippy',
    'description' => ${phpString(composer.description)},
    'category' => 'be',
    'state' => 'alpha',
    'version' => ${phpString(version)},
    'constraints' => [
        'depends' => [
            'typo3' => '${TYPO3_VERSIONS}',
            'rte_ckeditor' => '${TYPO3_VERSIONS}',
        ],
        'conflicts' => [],
        'suggests' => [],
    ],
    'autoload' => [
        'psr-4' => [
            'NlDesignSystemCommunity\\\\Clippy\\\\' => 'Classes/',
        ],
    ],
];
`,
  );
}

function writePackFiles({ name, version, license, repository, publishConfig }: Manifest): void {
  const { directory: _directory, ...publishSettings } = publishConfig;
  const manifest = { name, version, license, repository, publishConfig: publishSettings };
  writeFileSync(resolve(extensionOut, 'package.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  copyFileSync(resolve(packageDir, 'README.md'), resolve(extensionOut, 'README.md'));
}

export function generateExtension(): void {
  const manifest = JSON.parse(readFileSync(resolve(packageDir, 'package.json'), 'utf8')) as Manifest;
  // The TYPO3 extension itself (composer.json, event listener, import map, shim).
  cpSync(resolve(packageDir, 'extension'), extensionOut, {
    recursive: true,
    filter: (source) => !basename(source).startsWith('.'),
  });
  writeMetadata(manifest.version);

  writeStyles();
  writePageReview();

  rmSync(demoExtensionOut, { recursive: true, force: true });
  cpSync(extensionOut, demoExtensionOut, { recursive: true });

  writePackFiles(manifest);
}
