import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { chromium, type Page } from 'playwright';

const MANIFEST = join(import.meta.dirname, '..', 'package.json');

const { name: PACKAGE_NAME } = JSON.parse(readFileSync(MANIFEST, 'utf8')) as { name: string };

const VALIDATOR_BUNDLE = fileURLToPath(import.meta.resolve(PACKAGE_NAME));

const HTML_EXTENSIONS = ['.htm', '.html'];

const SNIPPET_LENGTH = 100;

const EXIT_CODE = { error: 2, ok: 0, violationsFound: 1 };

const HEADING_LEVELS = [1, 2, 3, 4, 5, 6];

function help(): string {
  return `
Usage: clippy-validate-html <path...> [options]

Validates HTML documents with the core validations of ${PACKAGE_NAME}.

Arguments:
  path              An .html or .htm file, or a directory to search for them

Options:
  --fix             Apply the available corrections
  --skip <selector> Drop everything matching this CSS selector before validating,
                    for demo or example markup that is wrong on purpose.
                    Repeatable
  --top-heading-level <1-6>
                    Highest heading level the documents may use. Defaults to 1;
                    raise it for fragments rendered under an existing outline
  --help, -h        Show this help

Exit codes:
  0                 No issues found, or --fix was given
  1                 Issues found
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

type ValidateSettings = {
  fix: boolean;
  skip: readonly string[];
  topHeadingLevel: number;
};

async function collectViolations(files: readonly string[], source: string, settings: ValidateSettings) {
  const browser = await chromium.launch();

  try {
    const page = await browser.newPage();
    const byFile: { file: string; violations: Violations }[] = [];

    for (const file of files) {
      await page.goto(pathToFileURL(file).href, { waitUntil: 'load' });
      byFile.push({ file, violations: await validatePage(page, source, settings) });
    }

    return byFile;
  } finally {
    await browser.close();
  }
}

type Violations = Awaited<ReturnType<typeof validatePage>>;

function validatePage(page: Page, source: string, settings: ValidateSettings) {
  return page.evaluate(
    async ({ fix, skip, source, topHeadingLevel }) => {
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

      const validator = new Validator({ topHeadingLevel, validations: Object.values(coreValidations) });
      const violations = validator.validate(document.body);

      if (fix) violations.forEach(({ correct }) => correct?.());

      return violations.map(({ element, ...violation }) => ({
        ...violation,
        html: element.outerHTML,
      }));
    },
    { ...settings, skip: [...settings.skip], source },
  );
}

const collapsedHtmlSnippet = (html: string): string => {
  const collapsed = html.replace(/\s+/g, ' ').trim();
  return collapsed.length > SNIPPET_LENGTH ? `${collapsed.slice(0, SNIPPET_LENGTH - 1)}…` : collapsed;
};

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    fix: { default: false, type: 'boolean' },
    help: { default: false, short: 'h', type: 'boolean' },
    skip: { multiple: true, type: 'string' },
    'top-heading-level': { type: 'string' },
  },
});

if (values['help']) {
  process.stdout.write(help() + '\n');
  process.exit(EXIT_CODE.ok);
}

if (positionals.length === 0) fail(`Missing path argument.\n\n${help()}`);

const topHeadingLevel = Number(values['top-heading-level'] ?? 1);

if (!HEADING_LEVELS.includes(topHeadingLevel)) {
  fail(`--top-heading-level must be one of ${HEADING_LEVELS.join(', ')}.`);
}

if (!existsSync(VALIDATOR_BUNDLE)) fail(`${PACKAGE_NAME} is not built — run \`pnpm build\` first.`);

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

const results = await collectViolations(files, source, {
  fix: values['fix'],
  skip: values['skip'] ?? [],
  topHeadingLevel,
}).catch((error: unknown) => fail(firstLineOf(error)));

let total = 0;

for (const { file, violations } of results) {
  if (violations.length === 0) continue;

  total += violations.length;
  console.log(relative(process.cwd(), file));

  for (const { html, messages, rule, severity } of violations) {
    console.log(`${severity}: ${rule} — ${messages.error}`);
    if (messages.solution !== undefined) console.log(`  ${messages.solution}`);
    console.log(`  ${collapsedHtmlSnippet(html)}`);
    console.log('');
  }
}

console.log(`${total} issue(s) found in ${files.length} document(s).`);
process.exitCode = total > 0 && !values['fix'] ? EXIT_CODE.violationsFound : EXIT_CODE.ok;
