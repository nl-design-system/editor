#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { extname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';

const FIXTURE = fileURLToPath(new URL('./fixtures/document.html', import.meta.url));

const VALIDATOR_BUNDLE = fileURLToPath(new URL('../dist/index.js', import.meta.url));

function help(): string {
  return `
Usage: validate-html [file] [options]

Validates an HTML document with the core validations. Defaults to the fixture in
scripts/fixtures/document.html, so it runs on its own without a dev server.
Validates the build output, so run \`pnpm build\` first.

Arguments:
  file              Path to an .html or .htm file (default: the fixture)

Options:
  --fix             Apply the available corrections
  --help, -h        Show this help
  `.trim();
}

async function collectViolations(file: string, source: string, fix: boolean) {
  const browser = await chromium.launch();

  try {
    const page = await browser.newPage();

    await page.goto(pathToFileURL(file).href, { waitUntil: 'load' });

    return await page.evaluate(
      async ({ fix, source }) => {
        const moduleUrl = URL.createObjectURL(new Blob([source], { type: 'text/javascript' }));
        const { coreValidations, Validator } = (await import(
          /* @vite-ignore */ moduleUrl
        )) as typeof import('../dist/index.js');
        URL.revokeObjectURL(moduleUrl);

        const validator = new Validator({ validations: Object.values(coreValidations) });
        const violations = validator.validate(document.body);

        if (fix) violations.forEach(({ correct }) => correct?.());

        return violations.map(({ element, ...violation }) => ({
          ...violation,
          html: element.outerHTML,
        }));
      },
      { fix, source },
    );
  } finally {
    await browser.close();
  }
}

const SNIPPET_LENGTH = 100;

const collapsedHtmlSnippet = (html: string): string => {
  const collapsed = html.replace(/\s+/g, ' ').trim();
  return collapsed.length > SNIPPET_LENGTH ? `${collapsed.slice(0, SNIPPET_LENGTH - 1)}…` : collapsed;
};

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    fix: { default: false, type: 'boolean' },
    help: { default: false, short: 'h', type: 'boolean' },
  },
});

if (values['help']) {
  process.stdout.write(help() + '\n');
  process.exit(0);
}

const file = positionals[0] === undefined ? FIXTURE : resolve(positionals[0]);

const HTML_EXTENSIONS = ['.htm', '.html'];

if (!HTML_EXTENSIONS.includes(extname(file).toLowerCase())) {
  throw new Error(`${file} is not an HTML file — expected ${HTML_EXTENSIONS.join(' or ')}.`);
}

try {
  readFileSync(file);
} catch (error) {
  throw new Error(`Could not read ${file}.`, { cause: error });
}

if (!existsSync(VALIDATOR_BUNDLE)) throw new Error(`${VALIDATOR_BUNDLE} is missing — run \`pnpm build\` first.`);

const source = readFileSync(VALIDATOR_BUNDLE, 'utf8');
const violations = await collectViolations(file, source, values['fix']);

for (const { html, messages, rule, severity } of violations) {
  console.log(`${severity}: ${rule} — ${messages.error}`);
  if (messages.solution !== undefined) console.log(`  ${messages.solution}`);
  console.log(`  ${collapsedHtmlSnippet(html)}`);
  console.log('');
}

console.log(`${violations.length} issue(s) found.`);
process.exitCode = violations.length > 0 && !values['fix'] ? 1 : 0;
