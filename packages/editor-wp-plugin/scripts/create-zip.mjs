/**
 * create-zip.mjs
 *
 * Packages the built WordPress plugin into a zip file that can be installed
 * directly from the WordPress admin → Plugins → Add New → Upload Plugin.
 *
 * Expected zip layout (WordPress requires a single top-level folder):
 *
 *   nl-design-system-community-editor-clippy-gutter.zip
 *   └── nl-design-system-community-editor-clippy-gutter/
 *       ├── plugin.php          ← WordPress plugin header
 *       ├── block.json          ← block registration metadata
 *       └── dist/
 *           ├── index.js
 *           ├── index.css
 *           └── index.asset.php ← dependency manifest read by register_block_type()
 *
 * Usage:
 *   node scripts/create-zip.mjs
 *
 * Or via pnpm:
 *   pnpm run build:zip
 */

import { execSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const PLUGIN_SLUG = 'nl-design-system-community-editor-clippy-gutter';
const stagingDir = resolve(root, 'tmp', PLUGIN_SLUG);
const zipPath = resolve(root, `${PLUGIN_SLUG}.zip`);

// ---------------------------------------------------------------------------
// Validate that the Vite build has been run first
// ---------------------------------------------------------------------------

const distIndex = resolve(root, 'dist', 'index.js');
if (!existsSync(distIndex)) {
  console.error('✖  dist/index.js not found. Run `pnpm run build:vite` first.');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Stage files
// ---------------------------------------------------------------------------

// Clean any previous staging directory.
if (existsSync(stagingDir)) {
  rmSync(stagingDir, { force: true, recursive: true });
}
mkdirSync(resolve(stagingDir, 'dist'), { recursive: true });

// plugin.php — WordPress plugin header; must be at the folder root.
copyFileSync(resolve(root, 'plugin.php'), resolve(stagingDir, 'plugin.php'));

// block.json — block registration read by register_block_type().
copyFileSync(resolve(root, 'block.json'), resolve(stagingDir, 'block.json'));

// Built JS bundle.
copyFileSync(distIndex, resolve(stagingDir, 'dist', 'index.js'));

// Built CSS (optional — Vite only emits it when there are styles to extract).
const distCss = resolve(root, 'dist', 'index.css');
if (existsSync(distCss)) {
  copyFileSync(distCss, resolve(stagingDir, 'dist', 'index.css'));
}

// index.asset.php — WordPress dependency manifest.
// register_block_type() reads this file to wire up the correct wp-* handles as
// script dependencies and to set the script version for cache-busting.
// Format mirrors the output of @wordpress/dependency-extraction-webpack-plugin.
const { version } = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf-8'));
const assetPhp = [
  '<?php',
  'return array(',
  "  'dependencies' => array( 'wp-blocks', 'wp-data', 'wp-element', 'wp-plugins' ),",
  `  'version'      => '${version}',`,
  ');',
].join('\n');
writeFileSync(resolve(stagingDir, 'dist', 'index.asset.php'), assetPhp, 'utf-8');

// ---------------------------------------------------------------------------
// Create zip
// ---------------------------------------------------------------------------

// Remove any previous zip.
if (existsSync(zipPath)) {
  rmSync(zipPath);
}

// The zip must be created relative to tmp/ so the archive root is the slug
// folder itself (not the full absolute path).
execSync(`zip -r "${zipPath}" "${PLUGIN_SLUG}"`, {
  cwd: resolve(root, 'tmp'),
  stdio: 'inherit',
});

// ---------------------------------------------------------------------------
// Clean up staging directory
// ---------------------------------------------------------------------------

rmSync(stagingDir, { force: true, recursive: true });

console.log(`\n✓  WordPress plugin zip created:`);
console.log(`   ${zipPath}`);
console.log(`\n   Install via WP Admin → Plugins → Add New → Upload Plugin\n`);

