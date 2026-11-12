import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';
import { after, test } from 'node:test';

const packageDir = resolve(import.meta.dirname, '../..');
const { version } = JSON.parse(readFileSync(resolve(packageDir, 'package.json'), 'utf8')) as { version: string };
const archivePath = resolve(packageDir, 'dist', `clippy-drupal-${version}.tgz`);

rmSync(archivePath, { force: true });
execFileSync('pnpm', ['run', 'pack'], { cwd: packageDir, stdio: 'inherit' });

const unpacked = mkdtempSync(join(tmpdir(), 'clippy-drupal-'));
after(() => rmSync(unpacked, { recursive: true, force: true }));
execFileSync('tar', ['-xzf', archivePath, '-C', unpacked]);
const paths = readdirSync(unpacked, { encoding: 'utf8', recursive: true, withFileTypes: true })
  .filter((entry) => entry.isFile())
  .map((entry) => join(entry.parentPath, entry.name).slice(unpacked.length + 1).split(sep).join('/'));

test('writes clippy-drupal-<version>.tgz to dist/', () => {
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

test('writes the package version into package/clippy.info.yml', () => {
  const info = readFileSync(join(unpacked, 'package/clippy.info.yml'), 'utf8');
  assert.ok(info.split('\n').includes(`version: '${version}'`));
});

test('contains the module files directly under package/', () => {
  for (const path of [
    'package/clippy.info.yml',
    'package/clippy.js',
    'package/clippy.libraries.yml',
    'package/clippy.ckeditor5.yml',
    'package/src/PageReview.php',
  ]) {
    assert.ok(paths.includes(path), `${path} is missing`);
  }
});

test('contains the licence, README and package.json', () => {
  for (const path of ['package/LICENSE.md', 'package/README.md', 'package/package.json']) {
    assert.ok(paths.includes(path), `${path} is missing`);
  }
});

test('contains no source or build output besides the module', () => {
  assert.deepEqual(
    paths.filter(
      (path) =>
        /^package\/(dist|module|node_modules)\//.test(path) ||
        /\.tsx?$/.test(path) ||
        (path.startsWith('package/src/') && !path.endsWith('.php')),
    ),
    [],
  );
});
