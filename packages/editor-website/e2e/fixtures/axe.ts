import AxeBuilder from '@axe-core/playwright';
import { test as base } from '@playwright/test';

interface AxeFixture {
  /** Creates an AxeBuilder that scans for WCAG 2.2 AA violations, outside `data-clippy-ignore`. */
  makeAxeBuilder: () => AxeBuilder;
}

export const test = base.extend<AxeFixture>({
  makeAxeBuilder: async ({ page }, use) => {
    const makeAxeBuilder = () =>
      new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .exclude('[data-clippy-ignore]:not([data-clippy-ignore="content"])')
        .exclude({ fromShadowDom: ['[data-clippy-ignore="content"]', '.tiptap > *'] })
        .exclude('[data-clippy-ignore="content"] .ck-content > *')
        // clippy-components 3.9.0 points this button's aria-controls at a drawer in another shadow root
        .exclude({ fromShadowDom: ['clippy-page-header', 'clippy-button[controls="clippy-mobile-menu-drawer"]'] });

    await use(makeAxeBuilder);
  },
});

export { expect } from '@playwright/test';
