#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';

/** Matches `server.port` in the editor-website's astro.config.mjs. */
const ORIGIN = 'http://localhost:5174';

/** The ES module built by `pnpm build`. */
const BUNDLE = fileURLToPath(new URL('../dist/index.js', import.meta.url));

function help(): string {
  return `
Usage: validate-html [path] [options]

Validates a page of the running editor-website. Start it first with
\`pnpm dev\` in packages/editor-website.

Arguments:
  path              Path to validate, e.g. /preview (default) or /en/guidelines

Options:
  --fix             Apply the available corrections and show the result
  --help, -h        Show this help
  `.trim();
}

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

const url = new URL(positionals[0] ?? '/preview', ORIGIN).href;

if (!existsSync(BUNDLE)) throw new Error(`${BUNDLE} is missing — run \`pnpm build\` first.`);

const browser = await chromium.launch();

try {
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'networkidle' });
  } catch (error) {
    throw new Error(`Could not load ${url} — start the site with \`pnpm dev\` in packages/editor-website.`, {
      cause: error,
    });
  }

  // The validator only speaks DOM, so it runs in the page rather than in Node.
  const findings = await page.evaluate(
    async ({ fix, source }) => {
      // Import the bundle as a module, so it needs no global to hand its exports back.
      const moduleUrl = URL.createObjectURL(new Blob([source], { type: 'text/javascript' }));
      const { coreValidations, Validator } = (await import(moduleUrl)) as typeof import('../src/index.ts');
      URL.revokeObjectURL(moduleUrl);

      const validator = new Validator({ validations: Object.values(coreValidations) });

      return validator.validate(document.body).map(({ correct, element, messages, rule, severity }) => {
        const before = element.outerHTML;
        if (fix) correct?.();

        return { after: fix ? element.outerHTML : undefined, before, message: messages.error, rule, severity };
      });
    },
    { fix: values['fix'], source: readFileSync(BUNDLE, 'utf8') },
  );

  console.log(`${url}\n`);

  for (const { after, before, message, rule, severity } of findings) {
    console.log(`${severity}: ${rule} — ${message}\n  ${before}`);
    if (after !== undefined) console.log(`  → ${after}`);
  }

  console.log(`\n${findings.length} issue(s) found.`);
  process.exitCode = findings.length > 0 && !values['fix'] ? 1 : 0;
} finally {
  await browser.close();
}
