import { execFile } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { build } from 'vite';
import { beforeAll, describe, expect, it } from 'vitest';

const CLI = fileURLToPath(new URL('../dist/cli.js', import.meta.url));
const FIXTURE = fileURLToPath(new URL('./fixtures/document.html', import.meta.url));
const FIXTURE_DIRECTORY = fileURLToPath(new URL('./fixtures/', import.meta.url));
const PACKAGE_ROOT = fileURLToPath(new URL('..', import.meta.url));
const VALIDATOR_CONFIG = fileURLToPath(new URL('../vite.validator.config.ts', import.meta.url));
const CLI_CONFIG = fileURLToPath(new URL('../vite.cli.config.ts', import.meta.url));

type Result = { code: number; stderr: string; stdout: string };

/** Runs the CLI with `input` as every key pressed on stdin. */
const runWithInput = async (input: string, ...args: string[]): Promise<Result> => {
  try {
    const running = promisify(execFile)(process.execPath, [CLI, ...args]);
    running.child.stdin?.end(input);
    const { stderr, stdout } = await running;
    return { code: 0, stderr, stdout };
  } catch (error) {
    const { code = 1, stderr = '', stdout = '' } = error as Partial<Result>;
    return { code, stderr, stdout };
  }
};

const ENTER = '\r';
const DOWN = '\u001B[B';

const run = (...args: string[]): Promise<Result> => runWithInput('', ...args);

// Both entry points are built, so the tests never run against a stale bin or a stale library.
beforeAll(async () => {
  await build({ configFile: VALIDATOR_CONFIG, logLevel: 'silent', root: PACKAGE_ROOT });
  await build({ configFile: CLI_CONFIG, logLevel: 'silent', root: PACKAGE_ROOT });
}, 120_000);

describe('validate-html', () => {
  it('reports every violation in the fixture and exits with 1', async () => {
    const { code, stdout } = await run(FIXTURE);

    expect(stdout).toContain('24 issue(s) found in 1 document(s).');
    expect(code).toBe(1);
  });

  it('names the rule, the message and the offending markup', async () => {
    const { stdout } = await run(FIXTURE);

    expect(stdout).toContain('warning: PARAGRAPH_SHOULD_NOT_BE_ENTIRELY_BOLD — Hele alinea is dikgedrukt');
    expect(stdout).toContain('<p><b>De aanvraag duurt vijf werkdagen.</b></p>');
    expect(stdout).toContain('info: PARAGRAPH_SHOULD_NOT_RESEMBLE_HEADING');
    expect(stdout).toContain('info: PARAGRAPH_SHOULD_NOT_BE_EMPTY — Alinea heeft geen inhoud');
  });

  it('reports violations from every component the fixture exercises', async () => {
    const { stdout } = await run(FIXTURE);

    const reported = new Set(stdout.match(/[A-Z][A-Z_]{8,}/g) ?? []);

    expect([...reported].sort()).toEqual([
      'DESCRIPTION_LIST_MUST_CONTAIN_TERM',
      'DESCRIPTION_SHOULD_NOT_BE_EMPTY',
      'DESCRIPTION_TERM_MUST_HAVE_DESCRIPTION',
      'DESCRIPTION_TERM_SHOULD_NOT_BE_EMPTY',
      'HEADING_LEVEL_MUST_NOT_SKIP',
      'HEADING_MUST_NOT_BE_EMPTY',
      'HEADING_SHOULD_NOT_CONTAIN_BOLD_OR_ITALIC',
      'IMAGE_MUST_HAVE_ALT_TEXT',
      'LINK_SHOULD_NOT_BE_EMPTY',
      'LINK_SHOULD_NOT_BE_TOO_GENERIC',
      'ORDERED_LIST_ITEM_SHOULD_NOT_BE_EMPTY',
      'PARAGRAPH_SHOULD_NOT_BE_EMPTY',
      'PARAGRAPH_SHOULD_NOT_BE_ENTIRELY_BOLD',
      'PARAGRAPH_SHOULD_NOT_CONTAIN_EMPTY_FORMATTING',
      'PARAGRAPH_SHOULD_NOT_CONTAIN_UNDERLINED_TEXT',
      'PARAGRAPH_SHOULD_NOT_RESEMBLE_HEADING',
      'PARAGRAPH_SHOULD_NOT_RESEMBLE_LIST',
      'TABLE_CAPTION_SHOULD_NOT_BE_EMPTY',
      'TABLE_CELL_SHOULD_NOT_BE_EMPTY',
      'TABLE_MUST_HAVE_HEADINGS',
      'TABLE_MUST_HAVE_MULTIPLE_ROWS',
      'UNORDERED_LIST_ITEM_SHOULD_NOT_BE_EMPTY',
    ]);
  });

  it('leaves the well-formed heading outline of the fixture alone', async () => {
    const { stdout } = await run(FIXTURE);

    expect(stdout).not.toContain('HEADING_MUST_START_AT_LEVEL_ONE');
    expect(stdout).not.toContain('HEADING_LEVEL_ONE_MUST_BE_UNIQUE');
  });

  it('prints the severity, the rule and the message, but not the documentation link', async () => {
    const { stdout } = await run(FIXTURE);

    expect(stdout).toContain('error: HEADING_MUST_NOT_BE_EMPTY — Kop heeft geen inhoud');
    expect(stdout).not.toContain('https://nldesignsystem.nl');
  });

  it('leaves the valid paragraphs of the fixture alone', async () => {
    const { stdout } = await run(FIXTURE);

    expect(stdout).not.toContain('U vraagt een paspoort aan bij de gemeente');
    expect(stdout).not.toContain('Een paspoort kost');
  });

  it('shows the corrections as a diff of each document', async () => {
    const { stdout } = await runWithInput(ENTER, FIXTURE, '--diff');
    const name = relative(process.cwd(), FIXTURE);

    expect(stdout).toContain(`--- ${name}\toriginal\n+++ ${name}\tcorrected`);
    expect(stdout).toMatch(/^-\s*<p><strong>Let op:<\/strong> <strong>u betaalt/m);
    expect(stdout).toMatch(/^\+\s*<p>Let op: u betaalt bij de aanvraag zelf en niet bij het ophalen\.<\/p>$/m);
  });

  it('reports the markup as it was found, before correcting', async () => {
    const { stdout } = await runWithInput(ENTER, FIXTURE, '--diff');

    expect(stdout).toMatch(/^ {2}<p><strong>Let op:<\/strong> <strong>u betaalt/m);
  });

  it('shows no diff without --diff', async () => {
    const { stdout } = await run(FIXTURE);

    expect(stdout).not.toMatch(/^--- /m);
  });

  it('keeps the exit code of the issues it found', async () => {
    const { code, stdout } = await run(FIXTURE, '--diff');

    expect(stdout).toContain('24 issue(s) found in 1 document(s).');
    expect(code).toBe(1);
  });

  it('writes nothing to disk', async () => {
    const before = readFileSync(FIXTURE, 'utf8');

    await runWithInput(ENTER, FIXTURE, '--diff');

    expect(readFileSync(FIXTURE, 'utf8')).toBe(before);
    expect(readdirSync(FIXTURE_DIRECTORY)).toEqual(['document.html']);
  });

  it('asks which correction to apply when an issue offers more than one', async () => {
    const { stderr } = await runWithInput(ENTER, FIXTURE, '--diff');

    expect(stderr).toContain('warning: PARAGRAPH_SHOULD_NOT_BE_ENTIRELY_BOLD — Hele alinea is dikgedrukt');
    expect(stderr).toContain('Dikgedrukt verwijderen');
    expect(stderr).toContain('Omzetten naar kop');
    expect(stderr).toContain('Skip');
  });

  it('leaves an issue with several corrections alone when it is skipped or goes unanswered', async () => {
    const [skipped, unanswered] = await Promise.all([
      runWithInput(`${DOWN}${DOWN}${ENTER}`, FIXTURE, '--diff'),
      run(FIXTURE, '--diff'),
    ]);

    expect(skipped.stdout).not.toMatch(/^[-+].*Let op/m);
    expect(unanswered.stdout).not.toMatch(/^[-+].*Let op/m);
  });

  it('leaves the empty paragraphs out of the diff, as they have no correction', async () => {
    const { stdout } = await run(FIXTURE, '--diff');

    expect(stdout).toContain('info: PARAGRAPH_SHOULD_NOT_BE_EMPTY');
    expect(stdout).not.toMatch(/^-\s*<p><\/p>$/m);
  });

  it('prints the usage when no path is given', async () => {
    const { code, stderr } = await run();

    expect(stderr).toContain('Missing path argument.');
    expect(stderr).toContain('Usage: clippy-validate-html <path...> [options]');
    expect(code).toBe(2);
  });

  it('prints the usage on --help', async () => {
    const { code, stdout } = await run('--help');

    expect(stdout).toContain('Usage: clippy-validate-html <path...> [options]');
    expect(code).toBe(0);
  });

  it('walks a directory for HTML documents', async () => {
    const { code, stdout } = await run(FIXTURE_DIRECTORY);

    expect(stdout).toContain('24 issue(s) found in 1 document(s).');
    expect(stdout).toContain(relative(process.cwd(), FIXTURE));
    expect(code).toBe(1);
  });

  it('validates every path it is given', async () => {
    const { stdout } = await run(FIXTURE, FIXTURE);

    expect(stdout).toContain('48 issue(s) found in 2 document(s).');
  });

  it('drops the elements matching --skip before validating', async () => {
    const { code, stdout } = await run(FIXTURE, '--skip', 'article');

    expect(stdout).toContain('0 issue(s) found in 1 document(s).');
    expect(code).toBe(0);
  });

  it('skips only what the selector matches', async () => {
    const { stdout } = await run(FIXTURE, '--skip', 'section');

    expect(stdout).toContain('4 issue(s) found in 1 document(s).');
  });

  it('exits with 0 when every issue found has info severity', async () => {
    const { code, stdout } = await run(FIXTURE, '--skip', 'section');

    expect(stdout).toContain('info: PARAGRAPH_SHOULD_NOT_BE_EMPTY');
    expect(stdout).not.toMatch(/^(error|warning):/m);
    expect(code).toBe(0);
  });

  it('exits with 1 on warnings, unless --allow-warnings is given', async () => {
    const [strict, allowed] = await Promise.all([
      run(FIXTURE, '--skip', 'section:last-of-type'),
      run(FIXTURE, '--skip', 'section:last-of-type', '--allow-warnings'),
    ]);

    expect(strict.stdout).toContain('warning: PARAGRAPH_SHOULD_NOT_BE_ENTIRELY_BOLD');
    expect(strict.stdout).not.toMatch(/^error:/m);
    expect(strict.code).toBe(1);
    expect(allowed.code).toBe(0);
  });

  it('still exits with 1 on errors when --allow-warnings is given', async () => {
    const { code, stdout } = await run(FIXTURE, '--allow-warnings');

    expect(stdout).toMatch(/^error:/m);
    expect(code).toBe(1);
  });

  it('refuses a --skip that is not a valid CSS selector', async () => {
    const { code, stderr } = await run(FIXTURE, '--skip', '[[nonsense');

    expect(stderr).toContain('[[nonsense is not a valid CSS selector.');
    expect(stderr).not.toContain('at UtilityScript');
    expect(code).toBe(2);
  });

  it('refuses a directory without HTML documents', async () => {
    const { code, stderr } = await run(fileURLToPath(new URL('../src/utils', import.meta.url)));

    expect(stderr).toContain('No HTML files found in');
    expect(code).toBe(2);
  });

  it('refuses a file that is not HTML', async () => {
    const { code, stderr } = await run(fileURLToPath(new URL('./index.ts', import.meta.url)));

    expect(stderr).toContain('is not an HTML file — expected .htm or .html.');
    expect(code).toBe(2);
  });

  it('refuses a file that does not exist', async () => {
    const { code, stderr } = await run(fileURLToPath(new URL('./fixtures/absent.html', import.meta.url)));

    expect(stderr).toContain('Could not read');
    expect(code).toBe(2);
  });
});
