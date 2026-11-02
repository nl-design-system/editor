import { unzipSync } from 'fflate';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { test } from 'node:test';

const packageDir = resolve(import.meta.dirname, '..');
const { version } = JSON.parse(readFileSync(resolve(packageDir, 'package.json'), 'utf8')) as { version: string };

const zipPath = execFileSync(process.execPath, [resolve(import.meta.dirname, 'package-extension.ts')], {
  encoding: 'utf8',
}).trim();
const entries = unzipSync(readFileSync(zipPath));
const paths = Object.keys(entries);

const readEntry = (path: string): string => {
  const entry = entries[path];
  assert.ok(entry, `${path} is missing`);
  return new TextDecoder().decode(entry);
};

test('writes clippy_<version>.zip to dist/', () => {
  assert.equal(zipPath, resolve(packageDir, 'dist', `clippy_${version}.zip`));
});

test('leaves out dot-prefixed paths', () => {
  assert.ok(paths.length > 0);
  assert.deepEqual(
    paths.filter((path) => path.split('/').some((segment) => segment.startsWith('.'))),
    [],
  );
});

test('writes the package version into composer.json at the archive root', () => {
  assert.equal((JSON.parse(readEntry('composer.json')) as { version?: string }).version, version);
});

test('writes the package version into ext_emconf.php at the archive root', () => {
  assert.equal(/'version'\s*=>\s*'([^']*)'/.exec(readEntry('ext_emconf.php'))?.[1], version);
});

test('contains the CKEditor bundle', () => {
  readEntry('Resources/Public/JavaScript/clippy.js');
});
