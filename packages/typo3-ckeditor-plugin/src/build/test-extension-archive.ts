import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';
import { after, test } from 'node:test';

const packageDir = resolve(import.meta.dirname, '../..');
const { version } = JSON.parse(readFileSync(resolve(packageDir, 'package.json'), 'utf8')) as { version: string };
const archivePath = resolve(packageDir, 'dist', `clippy-typo3-${version}.tgz`);

rmSync(archivePath, { force: true });
execFileSync('pnpm', ['run', 'pack'], { cwd: packageDir, stdio: 'inherit' });

const unpacked = mkdtempSync(join(tmpdir(), 'clippy-typo3-'));
after(() => rmSync(unpacked, { recursive: true, force: true }));
execFileSync('tar', ['-xzf', archivePath, '-C', unpacked]);
const paths = readdirSync(unpacked, { encoding: 'utf8', recursive: true, withFileTypes: true })
  .filter((entry) => entry.isFile())
  .map((entry) => join(entry.parentPath, entry.name).slice(unpacked.length + 1).split(sep).join('/'));

const readEntry = (path: string): string => readFileSync(join(unpacked, path), 'utf8');

test('writes clippy-typo3-<version>.tgz to dist/', () => {
  assert.ok(existsSync(archivePath), `${archivePath} is missing`);
});

test('puts every entry under package/', () => {
  assert.ok(paths.length > 0);
  assert.deepEqual(
    paths.filter((path) => !path.startsWith('package/')),
    [],
  );
});

test('leaves out dot-prefixed paths', () => {
  assert.deepEqual(
    paths.filter((path) => path.split('/').some((segment) => segment.startsWith('.'))),
    [],
  );
});

test('writes the package version into package/composer.json', () => {
  assert.equal((JSON.parse(readEntry('package/composer.json')) as { version?: string }).version, version);
});

test('writes the package version into package/ext_emconf.php', () => {
  assert.equal(/'version'\s*=>\s*'([^']*)'/.exec(readEntry('package/ext_emconf.php'))?.[1], version);
});

test('contains the extension files directly under package/', () => {
  for (const path of [
    'package/composer.json',
    'package/ext_emconf.php',
    'package/ext_localconf.php',
    'package/Configuration/JavaScriptModules.php',
    'package/Classes/EventListener/AddClippyEditorExtension.php',
    'package/Resources/Public/JavaScript/clippy.js',
    'package/Resources/Public/JavaScript/ckeditor5.js',
  ]) {
    assert.ok(paths.includes(path), `${path} is missing`);
  }
});

test('contains the licence, README and package.json', () => {
  for (const path of ['package/LICENSE.md', 'package/README.md', 'package/package.json']) {
    assert.ok(paths.includes(path), `${path} is missing`);
  }
});

test('contains no source or build output besides the extension', () => {
  assert.deepEqual(
    paths.filter(
      (path) => /^package\/(dist|extension|node_modules|src)\//.test(path) || /\.tsx?$/.test(path),
    ),
    [],
  );
});
