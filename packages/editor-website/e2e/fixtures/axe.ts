import AxeBuilder from '@axe-core/playwright';
import { expect as base, type Page } from '@playwright/test';

export const expect = base.extend({
  /** Whether axe finds WCAG 2.2 AA violations on the page, outside `data-clippy-ignore` and editor content. */
  async toHaveAutoDetectableA11yIssues(page: Page) {
    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .exclude('[data-clippy-ignore]')
      // Editor content holds intentional mistakes on the demo pages, and editors drop data-clippy-ignore from it
      .exclude('[slot=value]')
      .exclude({ fromShadowDom: ['clippy-editor', '.tiptap > *'] })
      .exclude('.ck-content > *')
      // Validation examples hold intentional mistakes, and data-clippy-ignore would hide them from validation too
      .exclude('.clippy-validation__content > *')
      // clippy-components 3.10.1 points this button's aria-controls at a drawer in another shadow root
      .exclude({ fromShadowDom: ['clippy-page-header', 'clippy-button[controls="clippy-mobile-menu-drawer"]'] })
      .analyze();

    return {
      message: () =>
        violations
          .map(({ id, help, nodes }) =>
            [`${id}: ${help}`, ...nodes.map(({ target }) => `  ${JSON.stringify(target)}`)].join('\n'),
          )
          .join('\n') || 'No axe violations found',
      pass: violations.length > 0,
    };
  },
});

export { test } from '@playwright/test';
