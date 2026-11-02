import { unzipSync } from 'fflate';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { test } from 'node:test';

const packageDir = resolve(import.meta.dirname, '../..');
const { version } = JSON.parse(readFileSync(resolve(packageDir, 'package.json'), 'utf8')) as { version: string };

const zipPath = execFileSync(process.execPath, [resolve(import.meta.dirname, 'package-extension.ts')], {
  encoding: 'utf8',
}).trim();
const entries = unzipSync(readFileSync(zipPath));
const paths = Object.keys(entries);

test('writes clippy-drupal-<version>.zip to dist/', () => {
  assert.equal(zipPath, resolve(packageDir, 'dist', `clippy-drupal-${version}.zip`));
});

test('puts every entry under clippy/', () => {
  assert.ok(paths.length > 0);
  assert.deepEqual(
    paths.filter((path) => !path.startsWith('clippy/')),
    [],
  );
});

test('leaves out dot-prefixed paths', () => {
  assert.deepEqual(
    paths.filter((path) => path.split('/').some((segment) => segment.startsWith('.'))),
    [],
  );
});

test('writes the package version into clippy/clippy.info.yml', () => {
  const info = entries['clippy/clippy.info.yml'];
  assert.ok(info, 'clippy/clippy.info.yml is missing');
  assert.ok(new TextDecoder().decode(info).split('\n').includes(`version: '${version}'`));
});

test('contains the CKEditor bundle and the libraries and plugin YAML', () => {
  for (const path of ['clippy/clippy.js', 'clippy/clippy.libraries.yml', 'clippy/clippy.ckeditor5.yml']) {
    assert.ok(entries[path], `${path} is missing`);
  }
});
