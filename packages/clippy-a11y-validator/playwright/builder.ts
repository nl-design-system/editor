import type { AnalysisResult, ValidatorSettings } from '@nl-design-system-community/clippy-a11y-validator';
import type { Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const VALIDATOR_PACKAGE = '@nl-design-system-community/clippy-a11y-validator';

let validatorSource: Promise<string> | undefined;

// Read the validator's dependency-free ESM bundle for page injection (memoised).
const loadValidatorSource = (): Promise<string> => {
  validatorSource ??= (async (): Promise<string> => {
    let resolved: string;
    try {
      resolved = import.meta.resolve(VALIDATOR_PACKAGE);
    } catch (cause) {
      throw new Error(`clippy-a11y-validator/playwright: could not resolve "${VALIDATOR_PACKAGE}"; is it installed?`, {
        cause,
      });
    }
    try {
      return await readFile(fileURLToPath(resolved), 'utf8');
    } catch (cause) {
      throw new Error(
        `clippy-a11y-validator/playwright: could not read the validator bundle at "${resolved}". ` +
          `Build it first with \`pnpm --filter ${VALIDATOR_PACKAGE} run build\`.`,
        { cause },
      );
    }
  })();
  return validatorSource;
};

export type ClippyBuilderOptions = {
  /** The Playwright page whose live DOM is analyzed. */
  page: Page;
};

type RunArgs = {
  source: string;
  selector: string | null;
  enableRules: string[];
  disableRules: string[];
  topHeadingLevel: number;
};

// Runs in the page: imports the injected bundle as an object-URL module and
// analyzes the (scoped) live DOM. Module-scoped so Playwright can serialize it.
const runInPage = async ({
  disableRules,
  enableRules,
  selector,
  source,
  topHeadingLevel,
}: RunArgs): Promise<AnalysisResult> => {
  const objectUrl = URL.createObjectURL(new Blob([source], { type: 'text/javascript' }));
  try {
    const module = await import(/* @vite-ignore */ objectUrl);
    const root = selector ? document.querySelector(selector) : document.body;
    if (!root) {
      throw new Error(`clippy-a11y-validator/playwright: no element matches selector "${selector}".`);
    }
    return new module.ClippyValidations()
      .enableRules(enableRules)
      .disableRules(disableRules)
      .settings({ topHeadingLevel })
      .analyze(root);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};

/**
 * Fluent, `AxeBuilder`-style accessibility runner for Playwright. Injects the
 * framework-agnostic Clippy validator into the page under test and runs it
 * against the live DOM — mirroring how `@axe-core/playwright` injects axe-core.
 *
 * @example
 * ```ts
 * import { test, expect } from '@playwright/test';
 * import ClippyBuilder from '@nl-design-system-community/clippy-a11y-validator/playwright';
 *
 * test('editor output is accessible', async ({ page }) => {
 *   await page.goto('/editor-preview');
 *   const results = await new ClippyBuilder({ page }).include('.clippy-content').analyze();
 *   expect(results.violations).toEqual([]);
 * });
 * ```
 */
export class ClippyBuilder {
  readonly #page: Page;
  #selector: string | null = null;
  #enableRules: string[] = ['*'];
  #disableRules: string[] = [];
  #topHeadingLevel = 1;

  constructor({ page }: ClippyBuilderOptions) {
    this.#page = page;
  }

  /** Scope analysis to the first element matching `selector` (default: `document.body`). */
  include(selector: string): this {
    this.#selector = selector;
    return this;
  }

  /** Limit analysis to the given rules (kebab-case or SCREAMING_SNAKE_CASE). Defaults to all rules. */
  enableRules(rules: string[]): this {
    this.#enableRules = rules;
    return this;
  }

  /** Exclude the given rules from analysis. */
  disableRules(rules: string[]): this {
    this.#disableRules = rules;
    return this;
  }

  /** Apply non-rule analysis settings, e.g. `{ topHeadingLevel: 2 }` (highest allowed starting heading level, default 1). */
  settings(settings: Partial<Pick<ValidatorSettings, 'topHeadingLevel'>>): this {
    if (settings.topHeadingLevel !== undefined) {
      this.#topHeadingLevel = settings.topHeadingLevel;
    }
    return this;
  }

  /** Inject the validator, run it against the (scoped) live DOM, and return grouped violations. */
  async analyze(): Promise<AnalysisResult> {
    const source = await loadValidatorSource();
    return this.#page.evaluate(runInPage, {
      disableRules: this.#disableRules,
      enableRules: this.#enableRules,
      selector: this.#selector,
      source,
      topHeadingLevel: this.#topHeadingLevel,
    });
  }
}

export default ClippyBuilder;
