import type { Page } from 'playwright';
import { cancel, isCancel, select } from '@clack/prompts';
import { createTwoFilesPatch, FILE_HEADERS_ONLY } from 'diff';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs, styleText } from 'node:util';

const MANIFEST = join(import.meta.dirname, '..', 'package.json');

const { name: PACKAGE_NAME } = JSON.parse(readFileSync(MANIFEST, 'utf8')) as { name: string };

const VALIDATOR_BUNDLE = fileURLToPath(import.meta.resolve(PACKAGE_NAME));

const HTML_EXTENSIONS = ['.htm', '.html'];

const SNIPPET_LENGTH = 100;

const EXIT_CODE = { error: 2, ok: 0, violationsFound: 1 };

function help(): string {
  return `
Usage: clippy-validate-html <path...> [options]

Validates HTML documents with the core validations of ${PACKAGE_NAME}.

Arguments:
  path              An .html or .htm file, or a directory to search for them

Options:
  --allow-warnings  Exit with 0 when no issues of error severity are found
  --diff            Apply the correction of each issue and show how each
                    document changes. When an issue offers more than one, ask
                    which; without an answer on stdin, it is left as it is.
                    Nothing is written to disk
  --skip <selector> Drop everything matching this CSS selector before validating,
                    for demo or example markup that is wrong on purpose.
                    Repeatable
  --help, -h        Show this help

Exit codes:
  0                 No issues above info severity found
  1                 Issues of error severity found, or of warning severity
                    without --allow-warnings
  2                 The arguments or the build output are unusable

Example:
  clippy-validate-html dist --skip [slot=value]
  `.trim();
}

const isHtmlFile = (path: string): boolean => HTML_EXTENSIONS.includes(extname(path).toLowerCase());

const htmlFilesIn = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);

    if (entry.isDirectory()) return htmlFilesIn(path);

    return entry.isFile() && isHtmlFile(path) ? [path] : [];
  });

const firstLineOf = (error: unknown): string => {
  const message = error instanceof Error ? error.message : String(error);
  return message.split('\n')[0] ?? message;
};

function fail(message: string): never {
  process.stderr.write(`${message}\n`);
  process.exit(EXIT_CODE.error);
}

/**
 * playwright is an optional peer: the library itself never needs a browser, only this CLI does.
 * Import it where it is used so installing the package stays cheap, and name what to install when
 * it turns out not to be there.
 */
async function launchBrowser() {
  try {
    const { chromium } = await import('playwright');
    return await chromium.launch();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ERR_MODULE_NOT_FOUND') throw error;

    return fail(
      `${PACKAGE_NAME} needs playwright to validate a document, and it is not installed.\n\n` +
        'Install it alongside this package:\n  npm install --save-dev playwright\n  npx playwright install chromium',
    );
  }
}

type CorrectionChoice = { html: string; labels: (string | undefined)[]; rule: string; severity: string; title: string };

const SKIP = -1;

const stdinEnded = new AbortController();
process.stdin.once('end', () => stdinEnded.abort());

/**
 * Asks which correction to apply, the way `changeset` asks its questions. Ctrl+C stops the run; once stdin
 * has ended, as in CI, the issue is skipped.
 */
async function chooseCorrection({ html, labels, rule, severity, title }: CorrectionChoice): Promise<number | null> {
  if (stdinEnded.signal.aborted) return null;

  const choice = await select({
    message: `${severity}: ${rule} — ${title}\n${collapsedHtmlSnippet(html)}`,
    options: [
      ...labels.map((label, index) => ({ label: label ?? `Correction ${index + 1}`, value: index })),
      { label: 'Skip', value: SKIP },
    ],
    output: process.stderr,
    signal: stdinEnded.signal,
  });

  if (isCancel(choice) && stdinEnded.signal.aborted) return null;
  if (isCancel(choice)) {
    cancel('Stopped fixing.', { output: process.stderr });
    process.exit(EXIT_CODE.error);
  }

  return choice === SKIP ? null : choice;
}

async function collectViolations(files: readonly string[], source: string, fix: boolean, skip: readonly string[]) {
  const browser = await launchBrowser();

  try {
    const page = await browser.newPage({ bypassCSP: true });
    await page.exposeFunction('chooseCorrection', chooseCorrection);
    const byFile: ({ file: string } & Awaited<ReturnType<typeof validatePage>>)[] = [];

    for (const file of files) {
      await page.goto(pathToFileURL(file).href, { waitUntil: 'load' });
      byFile.push({ file, ...(await validatePage(page, source, fix, skip)) }); // NOSONAR: one page, one prompt at a time
    }

    return byFile;
  } finally {
    await browser.close();
  }
}

function validatePage(page: Page, source: string, fix: boolean, skip: readonly string[]) {
  return page.evaluate(
    async ({ fix, skip, source }) => {
      for (const selector of skip) {
        try {
          document.querySelectorAll(selector).forEach((element) => element.remove());
        } catch {
          throw new Error(`${selector} is not a valid CSS selector.`);
        }
      }

      const moduleUrl = URL.createObjectURL(new Blob([source], { type: 'text/javascript' }));
      const { coreValidations, Validator } = (await import(
        /* @vite-ignore */ moduleUrl
      )) as typeof import('@nl-design-system-community/clippy-a11y-validator');
      URL.revokeObjectURL(moduleUrl);

      const validator = new Validator({ validations: Object.values(coreValidations) });
      const violations = validator.validate([document.body]);
      // Project explicitly rather than spreading: a correction's `execute` cannot cross the
      // serialisation boundary, and spreading would hand Node a truthy correction with its
      // function silently stripped. Projected before correcting, so the report shows the markup as found.
      const reported = violations.map(({ element, messages, rule, scope, severity }) => ({
        html: element.outerHTML,
        messages,
        rule,
        scope,
        severity,
      }));

      if (!fix) return { violations: reported };

      // Both sides come from the browser, so the diff shows the corrections, not how it serialises.
      const serialize = () => {
        const doctype = document.doctype ? `${new XMLSerializer().serializeToString(document.doctype)}\n` : '';
        return `${doctype}${document.documentElement.outerHTML}\n`;
      };
      const original = serialize();

      const { chooseCorrection } = globalThis as unknown as {
        chooseCorrection: (choice: CorrectionChoice) => Promise<number | null>;
      };

      for (const { corrections = [], element, messages, rule, severity } of violations) {
        if (corrections.length <= 1) {
          corrections[0]?.execute();
          continue;
        }

        const choice = {
          html: element.outerHTML,
          labels: corrections.map(({ label }) => label),
          rule,
          severity,
          title: messages.title,
        };
        const index = await chooseCorrection(choice); // NOSONAR: one prompt at a time, each correction changes the document
        if (index !== null) corrections[index]?.execute();
      }

      return { corrected: serialize(), original, violations: reported };
    },
    { fix, skip, source },
  );
}

const collapsedHtmlSnippet = (html: string): string => {
  const collapsed = html.replace(/\s+/g, ' ').trim();
  return collapsed.length > SNIPPET_LENGTH ? `${collapsed.slice(0, SNIPPET_LENGTH - 1)}…` : collapsed;
};

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    'allow-warnings': { default: false, type: 'boolean' },
    diff: { default: false, type: 'boolean' },
    help: { default: false, short: 'h', type: 'boolean' },
    skip: { multiple: true, type: 'string' },
  },
});

if (values['help']) {
  process.stdout.write(help() + '\n');
  process.exit(EXIT_CODE.ok);
}

if (positionals.length === 0) fail(`Missing path argument.\n\n${help()}`);

if (!existsSync(VALIDATOR_BUNDLE)) fail(`${PACKAGE_NAME} is not built — run \`pnpm run build\` first.`);

const files = positionals.flatMap((argument) => {
  const path = resolve(argument);
  const stats = statSync(path, { throwIfNoEntry: false });

  if (stats === undefined) fail(`Could not read ${path}.`);
  if (stats.isDirectory()) return htmlFilesIn(path);
  if (!isHtmlFile(path)) fail(`${path} is not an HTML file — expected ${HTML_EXTENSIONS.join(' or ')}.`);

  return [path];
});

if (files.length === 0) fail(`No HTML files found in ${positionals.join(', ')}.`);

const source = readFileSync(VALIDATOR_BUNDLE, 'utf8');

const results = await collectViolations(files, source, values['diff'], values['skip'] ?? []).catch((error: unknown) =>
  fail(firstLineOf(error)),
);

let total = 0;
let failing = 0;
const passingSeverities = values['allow-warnings'] ? ['info', 'warning'] : ['info'];

const DIFF_LINE_STYLES = { '-': 'red', '@': 'cyan', '+': 'green' } as const;

const styledDiffLine = (line: string): string => {
  const style =
    line.startsWith('---') || line.startsWith('+++') ? 'bold' : DIFF_LINE_STYLES[line[0] as '+' | '-' | '@'];
  return style ? styleText(style, line) : line;
};

for (const { corrected, file, original, violations } of results) {
  if (violations.length === 0) continue;

  total += violations.length;
  failing += violations.filter(({ severity }) => !passingSeverities.includes(severity)).length;
  console.log(relative(process.cwd(), file));

  // `explanation` and `solution` are HTML for a host to render, which this output is not.
  for (const { html, messages, rule, severity } of violations) {
    console.log(`${severity}: ${rule} — ${messages.title}`);
    console.log(`  ${collapsedHtmlSnippet(html)}`);
    console.log('');
  }

  if (original === undefined || corrected === undefined || original === corrected) continue;

  const name = relative(process.cwd(), file);
  const patch = createTwoFilesPatch(name, name, original, corrected, 'original', 'corrected', {
    headerOptions: FILE_HEADERS_ONLY,
  });
  console.log(patch.trimEnd().split('\n').map(styledDiffLine).join('\n'));
  console.log('');
}

console.log(`${total} issue(s) found in ${files.length} document(s).`);
process.exitCode = failing > 0 ? EXIT_CODE.violationsFound : EXIT_CODE.ok;
