import { zipSync, type Zippable } from 'fflate';
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import { moduleOut, packageVersion } from './generate-module.ts';

const releaseDir = resolve(import.meta.dirname, '../dist');
const zipPath = resolve(releaseDir, `clippy-drupal-${packageVersion()}.zip`);

const files: Zippable = Object.fromEntries(
  readdirSync(moduleOut, { encoding: 'utf8', recursive: true })
    .map((path) => path.split(sep))
    .filter((segments) => segments.every((segment) => !segment.startsWith('.')))
    .filter((segments) => statSync(resolve(moduleOut, ...segments)).isFile())
    .map((segments) => [['clippy', ...segments].join('/'), readFileSync(resolve(moduleOut, ...segments))]),
);

mkdirSync(releaseDir, { recursive: true });
writeFileSync(zipPath, zipSync(files));

console.log(zipPath);
