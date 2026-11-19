import { violation } from '@test/violation';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { page } from 'vitest/browser';
import { CustomEvents, type FocusNodeDetail } from '@/events';
import { initializeLocale } from '@/localization';
import './index';
import type { HeadingStructure } from './index';

async function setupWithContent(
  contentHtml: string,
): Promise<{ headingStructure: HeadingStructure; root: HTMLElement }> {
  const root = document.body.appendChild(document.createElement('div'));
  root.innerHTML = contentHtml;
  const headingStructure = document.body.appendChild(document.createElement('clippy-heading-structure'));
  headingStructure.htmlDocument = root;
  await initializeLocale();
  await headingStructure.updateComplete;

  return { headingStructure, root };
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

      const emptyState = headingStructure.shadowRoot?.querySelector('.clippy-heading-structure__empty');
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

      const badges = Array.from(headingStructure.shadowRoot?.querySelectorAll('.nl-data-badge') ?? []);
      expect(badges.map((b) => b.textContent?.trim())).toEqual(['H1', 'H2']);
    });

    it('gives each badge an accessible aria-label with the heading level', async () => {
      const { headingStructure } = await setupWithContent('<h1>Titel</h1>');

      const badge = headingStructure.shadowRoot?.querySelector('.nl-data-badge');
      expect(badge).toHaveAttribute('aria-label', 'Kopniveau 1');
    });

    it('renders the heading text in the link', async () => {
      const { headingStructure } = await setupWithContent('<h1>Mijn paginatitel</h1>');

      const button = headingStructure.shadowRoot?.querySelector('button');
      expect(button?.textContent?.replace(/\s+/g, ' ').trim()).toBe('H1 Mijn paginatitel');
    });

    it('shows "(leeg)" when the heading is empty', async () => {
      const { headingStructure } = await setupWithContent('<h1></h1>');

      const button = headingStructure.shadowRoot?.querySelector('button');
      expect(button?.textContent?.trim()).toContain('(leeg)');
    });

    it('renders headings in document order', async () => {
      const { headingStructure } = await setupWithContent('<h1>Eerste</h1><h2>Tweede</h2><h3>Derde</h3>');

      const buttons = Array.from(headingStructure.shadowRoot?.querySelectorAll('button') ?? []);
      expect(buttons.map((b) => b.textContent?.replace(/\s+/g, ' ').trim())).toEqual([
        'H1 Eerste',
        'H2 Tweede',
        'H3 Derde',
      ]);
    });
  });

  describe('guideline', () => {
    it('has a heading and a link to the guidelines in a new tab', async () => {
      await setupWithContent('<h1>Titel</h1>');

      await expect.element(page.getByRole('heading', { name: 'Kopstructuur', level: 3 })).toBeVisible();
      await expect.element(page.getByText(/Dit overzicht toont alle koppen in de tekst/)).toBeVisible();
      const link = page.getByRole('link', { name: 'Richtlijnen voor koppen' });
      await expect
        .element(link)
        .toHaveAttribute('href', 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/koppen/');
      await expect.element(link).toHaveAttribute('target', '_blank');
    });
  });

  describe('severity', () => {
    it('marks a heading with a validation with its highest severity', async () => {
      const { headingStructure, root } = await setupWithContent('<h1>Titel</h1><h2>Sectie</h2>');
      const range = document.createRange();
      range.selectNode(root.querySelector('h2')!);
      headingStructure.violationsMap = new Map([[range, violation({ range, severity: 'warning' })]]);
      await headingStructure.updateComplete;

      const [h1, h2] = headingStructure.shadowRoot!.querySelectorAll('.clippy-heading-structure__button');
      expect(h1.className).not.toMatch(/--(error|warning|info)/);
      expect(h2).toHaveClass('clippy-heading-structure__button--warning');
    });
  });

  describe('validation button', () => {
    const validationButton = (headingStructure: HeadingStructure) =>
      headingStructure.shadowRoot?.querySelector('clippy-validation-button');

    it('does not render a validation button for a heading without validations', async () => {
      const { headingStructure } = await setupWithContent('<h1>Titel</h1>');

      expect(validationButton(headingStructure)).toBeNull();
    });

    it('renders a validation button with the validations of the heading, outside its button', async () => {
      const { headingStructure, root } = await setupWithContent('<h1>Titel</h1>');
      const headingRange = document.createRange();
      headingRange.selectNode(root.querySelector('h1')!);
      headingStructure.identifier = 'editor';
      headingStructure.violationsMap = new Map([
        [headingRange, violation({ range: headingRange, severity: 'warning' })],
      ]);
      await headingStructure.updateComplete;

      expect(validationButton(headingStructure)!.identifier).toBe('editor');
      expect(validationButton(headingStructure)!.violations.map(({ range }) => range)).toEqual([headingRange]);
      expect(validationButton(headingStructure)!.closest('button')).toBeNull();
    });
  });

  describe('interactivity', () => {
    let details: FocusNodeDetail[];
    const record = (event: Event) => details.push((event as CustomEvent<FocusNodeDetail>).detail);

    beforeEach(() => {
      details = [];
      globalThis.addEventListener(CustomEvents.FOCUS_NODE, record);
    });

    afterEach(() => {
      globalThis.removeEventListener(CustomEvents.FOCUS_NODE, record);
    });

    it('asks to focus the clicked heading itself, also when it has a validation', async () => {
      const { headingStructure, root } = await setupWithContent('<h1>Titel</h1>');
      headingStructure.identifier = 'editor';
      const headingRange = document.createRange();
      headingRange.selectNode(root.querySelector('h1')!);
      headingStructure.violationsMap = new Map([
        [headingRange, violation({ range: headingRange, severity: 'warning' })],
      ]);
      await headingStructure.updateComplete;

      headingStructure.shadowRoot!.querySelector('button')!.click();

      expect(details).toHaveLength(1);
      expect(details[0].range.startContainer).toBe(root.querySelector('h1'));
      expect(details[0].range.startOffset).toBe(0);
    });

    it('asks to focus a clicked heading without a validation', async () => {
      const { headingStructure, root } = await setupWithContent('<h1>Titel</h1>');
      headingStructure.identifier = 'editor';
      await headingStructure.updateComplete;

      headingStructure.shadowRoot!.querySelector('button')!.click();

      expect(details).toHaveLength(1);
      expect(details[0].identifier).toBe('editor');
      expect(details[0].range.startContainer).toBe(root.querySelector('h1'));
      expect(details[0].range.startOffset).toBe(0);
    });
  });
});
