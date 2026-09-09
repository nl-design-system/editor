import { execFile } from 'node:child_process';
import { readFileSync } from 'node:fs';
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

const run = async (...args: string[]): Promise<Result> => {
  try {
    const { stderr, stdout } = await promisify(execFile)(process.execPath, [CLI, ...args]);
    return { code: 0, stderr, stdout };
  } catch (error) {
    const { code = 1, stderr = '', stdout = '' } = error as Partial<Result>;
    return { code, stderr, stdout };
  }
};

// Both entry points are built, so the tests never run against a stale bin or a stale library.
beforeAll(async () => {
  await build({ configFile: VALIDATOR_CONFIG, logLevel: 'silent', root: PACKAGE_ROOT });
  await build({ configFile: CLI_CONFIG, logLevel: 'silent', root: PACKAGE_ROOT });
}, 120_000);

describe('validate-html', () => {
  it('reports every violation in the fixture and exits with 1', async () => {
    const { code, stdout } = await run(FIXTURE);

    expect(stdout).toContain('5 issue(s) found in 1 document(s).');
    expect(code).toBe(1);
  });

  it('names the rule, the message and the offending markup', async () => {
    const { stdout } = await run(FIXTURE);

    expect(stdout).toContain('warning: PARAGRAPH_SHOULD_NOT_BE_ENTIRELY_BOLD — De hele alinea is dikgedrukt.');
    expect(stdout).toContain('<p><b>De aanvraag duurt vijf werkdagen.</b></p>');
    expect(stdout).toContain('info: PARAGRAPH_SHOULD_NOT_BE_EMPTY — Deze alinea is leeg.');
  });

  it('leaves the valid paragraphs of the fixture alone', async () => {
    const { stdout } = await run(FIXTURE);

    expect(stdout).not.toContain('U vraagt een paspoort aan bij de gemeente');
    expect(stdout).not.toContain('Een paspoort kost');
  });

  it('exits with 0 when the corrections are applied', async () => {
    const { code, stdout } = await run(FIXTURE, '--fix');

    expect(stdout).toContain('5 issue(s) found in 1 document(s).');
    expect(code).toBe(0);
  });

  it('reports the corrected markup once the corrections are applied', async () => {
    const [reported, fixed] = await Promise.all([run(FIXTURE), run(FIXTURE, '--fix')]);

    expect(reported.stdout).toContain('<p><strong>Wat neemt u mee?</strong></p>');
    expect(fixed.stdout).toContain('<p>Wat neemt u mee?</p>');
    expect(fixed.stdout).not.toContain('<strong>');
    expect(fixed.stdout).not.toContain('<b>');
  });

  it('reports the empty paragraphs unchanged, as they have no correction', async () => {
    const { stdout } = await run(FIXTURE, '--fix');

    expect(stdout).toContain('info: PARAGRAPH_SHOULD_NOT_BE_EMPTY');
    expect(stdout).toContain('<p></p>');
  });

  it('corrects in memory and leaves the file on disk untouched', async () => {
    const before = readFileSync(FIXTURE, 'utf8');

    await run(FIXTURE, '--fix');

    expect(readFileSync(FIXTURE, 'utf8')).toBe(before);
    expect(before).toContain('<p><strong>Wat neemt u mee?</strong></p>');
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

    expect(stdout).toContain('5 issue(s) found in 1 document(s).');
    expect(stdout).toContain(relative(process.cwd(), FIXTURE));
    expect(code).toBe(1);
  });

  it('validates every path it is given', async () => {
    const { stdout } = await run(FIXTURE, FIXTURE);

    expect(stdout).toContain('10 issue(s) found in 2 document(s).');
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
