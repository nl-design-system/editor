import { execFile } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { build } from 'vite';
import { beforeAll, describe, expect, it } from 'vitest';

const CLI = fileURLToPath(new URL('./clippy-validate-html.ts', import.meta.url));
const FIXTURE = fileURLToPath(new URL('./fixtures/document.html', import.meta.url));
const PACKAGE_ROOT = fileURLToPath(new URL('..', import.meta.url));
const VALIDATOR_BUNDLE = fileURLToPath(new URL('../dist/index.js', import.meta.url));

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

// The CLI runs the build output, so the bundle has to exist before any of this means anything.
beforeAll(async () => {
  if (!existsSync(VALIDATOR_BUNDLE)) await build({ logLevel: 'silent', root: PACKAGE_ROOT });
}, 60_000);

describe('validate-html', () => {
  it('reports every violation in the fixture and exits with 1', async () => {
    const { code, stdout } = await run(FIXTURE);

    expect(stdout).toContain('5 issue(s) found.');
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

    expect(stdout).toContain('5 issue(s) found.');
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

  it('prints the usage when no file is given', async () => {
    const { code, stderr } = await run();

    expect(stderr).toContain('Missing file argument.');
    expect(stderr).toContain('Usage: validate-html <file> [options]');
    expect(code).toBe(2);
  });

  it('prints the usage on --help', async () => {
    const { code, stdout } = await run('--help');

    expect(stdout).toContain('Usage: validate-html <file> [options]');
    expect(code).toBe(0);
  });

  it('refuses a file that is not HTML', async () => {
    const { code, stderr } = await run(CLI);

    expect(stderr).toContain('is not an HTML file — expected .htm or .html.');
    expect(code).toBe(2);
  });

  it('refuses a file that does not exist', async () => {
    const { code, stderr } = await run(fileURLToPath(new URL('./fixtures/absent.html', import.meta.url)));

    expect(stderr).toContain('Could not read');
    expect(code).toBe(2);
  });
});
