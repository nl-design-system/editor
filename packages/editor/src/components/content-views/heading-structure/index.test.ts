import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { ValidationsMap } from '../../../types/validation.ts';
import type { Context } from '../../context';
import type { HeadingStructure } from './index.ts';
import '../../context/index.ts';
import '../../content/index.ts';
import './index.ts';
import { CustomEvents } from '../../../events';

async function setupWithContent(
  contentHtml: string,
): Promise<{ contextEl: Context; headingStructure: HeadingStructure }> {
  document.body.innerHTML = `
    <clippy-context id="heading-structure-test">
      <div slot="value" hidden>${contentHtml}</div>
      <clippy-content></clippy-content>
      <clippy-heading-structure></clippy-heading-structure>
    </clippy-context>
  `;

  const headingStructure = document.querySelector('clippy-heading-structure') as unknown as HeadingStructure;
  const contextEl = document.querySelector('clippy-context') as unknown as Context;

  await headingStructure.updateComplete;

  return { contextEl, headingStructure };
}

describe('<clippy-heading-structure>', () => {
  beforeEach(() => {
    document.documentElement.lang = 'nl';
  });

  afterEach(() => {
    document.body.innerHTML = '';
    document.documentElement.removeAttribute('lang');
  });

  describe('landmark', () => {
    it('renders a <nav> with the accessible label "Kopstructuur"', async () => {
      const { headingStructure } = await setupWithContent('<h1>Titel</h1>');

      const nav = headingStructure.shadowRoot?.querySelector('nav');
      expect(nav).toBeVisible();
      expect(nav).toHaveAttribute('aria-label', 'Kopstructuur');
    });
  });

  describe('empty state', () => {
    it('shows the empty-state message when the document contains no headings', async () => {
      const { headingStructure } = await setupWithContent('<p>Paragraaf zonder kop.</p>');

      const emptyState = headingStructure.shadowRoot?.querySelector('p');
      expect(emptyState).toBeVisible();
      expect(emptyState?.textContent?.trim()).toContain('Geen koppen gevonden in dit document.');
    });

    it('does not render any list items in the empty state', async () => {
      const { headingStructure } = await setupWithContent('<p>Geen koppen hier.</p>');

      expect(headingStructure.shadowRoot?.querySelectorAll('li').length).toBe(0);
    });
  });

  describe('heading entries', () => {
    it('renders one list item for a single heading', async () => {
      const { headingStructure } = await setupWithContent('<h1>Titel</h1>');

      expect(headingStructure.shadowRoot?.querySelectorAll('li').length).toBe(1);
    });

    it('renders one list item per heading when multiple headings are present', async () => {
      const { headingStructure } = await setupWithContent('<h1>Titel</h1><h2>Sectie</h2><h3>Subsectie</h3>');

      expect(headingStructure.shadowRoot?.querySelectorAll('li').length).toBe(3);
    });

    it('sets the data-level attribute to the heading level on each list item', async () => {
      const { headingStructure } = await setupWithContent('<h1>Titel</h1><h2>Sectie</h2>');

      const items = headingStructure.shadowRoot?.querySelectorAll('li');
      expect(items?.length).toBe(2);
      expect(items?.[0]).toHaveAttribute('data-level', '1');
      expect(items?.[1]).toHaveAttribute('data-level', '2');
    });

    it('renders the heading level badge with the correct text (H1, H2, …)', async () => {
      const { headingStructure } = await setupWithContent('<h1>Titel</h1><h2>Sectie</h2>');

      const badges = Array.from(headingStructure.shadowRoot?.querySelectorAll('[aria-label^="Heading level"]') ?? []);
      expect(badges.map((b) => b.textContent?.trim())).toEqual(['H1', 'H2']);
    });

    it('gives each badge an accessible aria-label with the heading level', async () => {
      const { headingStructure } = await setupWithContent('<h1>Titel</h1>');

      const badge = headingStructure.shadowRoot?.querySelector('[aria-label^="Heading level"]');
      expect(badge).toHaveAttribute('aria-label', 'Heading level 1');
    });

    it('renders the heading text in the link', async () => {
      const { headingStructure } = await setupWithContent('<h1>Mijn paginatitel</h1>');

      const link = headingStructure.shadowRoot?.querySelector('a');
      expect(link?.textContent?.trim()).toBe('Mijn paginatitel');
    });

    it('shows "(leeg)" when the heading is empty', async () => {
      const { headingStructure } = await setupWithContent('<h1></h1>');

      const link = headingStructure.shadowRoot?.querySelector('a');
      expect(link?.textContent?.trim()).toContain('(leeg)');
    });

    it('renders headings in document order', async () => {
      const { headingStructure } = await setupWithContent('<h1>Eerste</h1><h2>Tweede</h2><h3>Derde</h3>');

      const links = Array.from(headingStructure.shadowRoot?.querySelectorAll('a') ?? []);
      expect(links.map((a) => a.textContent?.trim())).toEqual(['Eerste', 'Tweede', 'Derde']);
    });
  });

  describe('interactivity', () => {
    it('dispatches FOCUS_VALIDATION_ITEM_IN_GUTTER with the validation key when clicking a heading that has a validation entry', async () => {
      const headingPos = 0;
      const validationKey = 'heading-should-not-be-empty_0';

      const { contextEl, headingStructure } = await setupWithContent('<h1>Titel</h1>');

      const validationsMap: ValidationsMap = new Map([
        [validationKey, { boundingBox: null, pos: headingPos, severity: 'warning' }],
      ]);

      contextEl.updateValidationsContext(validationsMap);
      await contextEl.updateComplete;
      headingStructure.requestUpdate();
      await headingStructure.updateComplete;

      const anchor = headingStructure.shadowRoot!.querySelector('a') as HTMLAnchorElement;
      expect(anchor).toBeVisible();

      let receivedKey: string | undefined;
      const handler = (e: Event) => {
        receivedKey = (e as CustomEvent<{ key: string }>).detail.key;
      };
      globalThis.addEventListener(CustomEvents.FOCUS_VALIDATION_ITEM_IN_GUTTER, handler);

      anchor.click();

      expect(receivedKey).toBe(validationKey);

      globalThis.removeEventListener(CustomEvents.FOCUS_VALIDATION_ITEM_IN_GUTTER, handler);
    });

    it('does not dispatch FOCUS_VALIDATION_ITEM_IN_GUTTER when the clicked heading has no validation entry', async () => {
      const { headingStructure } = await setupWithContent('<h1>Titel</h1>');

      const anchor = headingStructure.shadowRoot!.querySelector('a') as HTMLAnchorElement;
      expect(anchor).toBeVisible();

      let eventFired = false;
      const handler = () => {
        eventFired = true;
      };
      globalThis.addEventListener(CustomEvents.FOCUS_VALIDATION_ITEM_IN_GUTTER, handler);

      anchor.click();

      expect(eventFired).toBe(false);

      globalThis.removeEventListener(CustomEvents.FOCUS_VALIDATION_ITEM_IN_GUTTER, handler);
    });
  });
});
