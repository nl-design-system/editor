import { zipSync, type Zippable } from 'fflate';
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import { extensionOut, packageVersion } from './generate-extension.ts';

const releaseDir = resolve(import.meta.dirname, '../dist');
const zipPath = resolve(releaseDir, `clippy_${packageVersion()}.zip`);

const files: Zippable = Object.fromEntries(
  readdirSync(extensionOut, { encoding: 'utf8', recursive: true })
    .map((path) => path.split(sep))
    .filter((segments) => segments.every((segment) => !segment.startsWith('.')))
    .filter((segments) => statSync(resolve(extensionOut, ...segments)).isFile())
    .map((segments) => [segments.join('/'), readFileSync(resolve(extensionOut, ...segments))]),
);

mkdirSync(releaseDir, { recursive: true });
writeFileSync(zipPath, zipSync(files));

console.log(zipPath);
