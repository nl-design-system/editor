import { cancel, isCancel, select } from '@clack/prompts';
import {
  coreValidations,
  getAlternativeCorrections,
  getPrimaryCorrection,
  Validator,
} from '@nl-design-system-community/clippy-a11y-validator';
import { createTwoFilesPatch, FILE_HEADERS_ONLY } from 'diff';
import { Window } from 'happy-dom';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';
import { parseArgs, styleText } from 'node:util';

const MANIFEST = join(import.meta.dirname, '..', 'package.json');

const { name: PACKAGE_NAME } = JSON.parse(readFileSync(MANIFEST, 'utf8')) as { name: string };

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
  2                 The arguments are unusable

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
 * The validator reads the DOM through globals, as it does in a browser. Every document is parsed in this one
 * window, so `instanceof HTMLElement` holds for its elements.
 */
const window = new Window();
Object.assign(globalThis, {
  document: window.document,
  DOMParser: window.DOMParser,
  Element: window.Element,
  HTMLElement: window.HTMLElement,
  Node: window.Node,
  NodeFilter: window.NodeFilter,
  XMLSerializer: window.XMLSerializer,
});

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
    cancel('Cancelled while choosing a correction.', { output: process.stderr });
    process.exit(EXIT_CODE.error);
  }

  return choice === SKIP ? null : choice;
}

async function collectViolations(files: readonly string[], fix: boolean, skip: readonly string[]) {
  const byFile: ({ file: string } & Awaited<ReturnType<typeof validateDocument>>)[] = [];

  for (const file of files) {
    byFile.push({ file, ...(await validateDocument(file, fix, skip)) }); // NOSONAR: one prompt at a time
  }

  return byFile;
}

async function validateDocument(file: string, fix: boolean, skip: readonly string[]) {
  const document = new DOMParser().parseFromString(readFileSync(file, 'utf8'), 'text/html');

  for (const selector of skip) {
    try {
      document.querySelectorAll(selector).forEach((element) => element.remove());
    } catch {
      throw new Error(`${selector} is not a valid CSS selector.`);
    }
  }

  const validator = new Validator({ validations: Object.values(coreValidations) });
  const violations = validator.validate([document.body]);
  // Projected before correcting, so the report shows the markup as found.
  const reported = violations.map(({ element, messages, rule, scope, severity }) => ({
    html: element.outerHTML,
    messages,
    rule,
    scope,
    severity,
  }));

  if (!fix) return { violations: reported };

  const serialize = () => {
    const doctype = document.doctype ? `${new XMLSerializer().serializeToString(document.doctype)}\n` : '';
    return `${doctype}${document.documentElement.outerHTML}\n`;
  };
  const original = serialize();

  for (const { corrections = [], element, messages, rule, severity } of violations) {
    if (getAlternativeCorrections(corrections).length === 0) {
      getPrimaryCorrection(corrections)?.execute();
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

const files = positionals.flatMap((argument) => {
  const path = resolve(argument);
  const stats = statSync(path, { throwIfNoEntry: false });

  if (stats === undefined) fail(`Could not read ${path}.`);
  if (stats.isDirectory()) return htmlFilesIn(path);
  if (!isHtmlFile(path)) fail(`${path} is not an HTML file — expected ${HTML_EXTENSIONS.join(' or ')}.`);

  return [path];
});

if (files.length === 0) fail(`No HTML files found in ${positionals.join(', ')}.`);

const results = await collectViolations(files, values['diff'], values['skip'] ?? []).catch((error: unknown) =>
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
