import { violation } from '@test/violation';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
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
    it('starts with a heading and ends with an explanation and a button link to the guidelines', async () => {
      const { headingStructure } = await setupWithContent('<h1>Titel</h1>');

      const [first, ...rest] = [...headingStructure.shadowRoot!.children];
      const title = first.querySelector('h3')!;
      expect(first).toHaveClass('clippy-heading-structure__intro');
      expect(first.children).toHaveLength(1);
      expect(title.textContent?.trim()).toBe('Kopstructuur');
      const explanation = rest.at(-1)!;
      const [description, link] = explanation.children;
      expect(explanation).toHaveClass('clippy-heading-structure__guideline');
      expect(explanation.previousElementSibling?.tagName).toBe('NAV');
      expect(description).toHaveClass('nl-paragraph');
      expect(link).toHaveClass('nl-button', 'nl-button--secondary');
      expect(link).toHaveAttribute('href', 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/koppen/');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link.textContent?.trim()).toBe('Richtlijnen voor koppen');
    });
  });

  describe('layout', () => {
    it('does not underline the headings', async () => {
      const { headingStructure } = await setupWithContent('<h1>Titel</h1>');

      const button = headingStructure.shadowRoot!.querySelector('.clippy-heading-structure__button')!;
      expect(getComputedStyle(button).textDecorationLine).toBe('none');
    });

    it('centres the validation toggle vertically on the heading text', async () => {
      const { headingStructure, root } = await setupWithContent('<h1>Titel</h1>');
      const range = document.createRange();
      range.selectNode(root.querySelector('h1')!);
      headingStructure.violationsMap = new Map([[range, violation({ range, severity: 'error' })]]);
      await headingStructure.updateComplete;
      const toggle = headingStructure.shadowRoot!.querySelector('clippy-validation-toggle')!;
      await toggle.updateComplete;

      const middle = (element: Element) => {
        const { bottom, top } = element.getBoundingClientRect();
        return (top + bottom) / 2;
      };
      const text = headingStructure.shadowRoot!.querySelector('.clippy-heading-structure__text')!;
      expect(Math.abs(middle(toggle) - middle(text))).toBeLessThanOrEqual(1);
    });
  });

  describe('severity', () => {
    it('shows a heading with a validation entirely in the colour of its highest severity', async () => {
      const { headingStructure, root } = await setupWithContent('<h1>Titel</h1><h2>Sectie</h2>');
      headingStructure.style.setProperty('--basis-color-warning-color-default', 'rgb(1, 2, 3)');
      const range = document.createRange();
      range.selectNode(root.querySelector('h2')!);
      headingStructure.violationsMap = new Map([[range, violation({ range, severity: 'warning' })]]);
      await headingStructure.updateComplete;

      const [h1, h2] = headingStructure.shadowRoot!.querySelectorAll('.clippy-heading-structure__button');
      expect(h1.className).not.toMatch(/--(error|warning|info)/);
      expect(h2).toHaveClass('clippy-heading-structure__button--warning');
      expect(getComputedStyle(h2.querySelector('.clippy-heading-structure__text')!).color).toBe('rgb(1, 2, 3)');
      expect(getComputedStyle(h1.querySelector('.clippy-heading-structure__text')!).color).not.toBe('rgb(1, 2, 3)');
    });
  });

  describe('validation toggle', () => {
    const toggle = (headingStructure: HeadingStructure) =>
      headingStructure.shadowRoot?.querySelector('clippy-validation-toggle');

    it('does not render a toggle for a heading without validations', async () => {
      const { headingStructure } = await setupWithContent('<h1>Titel</h1>');

      expect(toggle(headingStructure)).toBeNull();
    });

    it('renders a toggle with the validations of the heading, outside its button', async () => {
      const { headingStructure, root } = await setupWithContent('<h1>Titel</h1>');
      const headingRange = document.createRange();
      headingRange.selectNode(root.querySelector('h1')!);
      headingStructure.identifier = 'editor';
      headingStructure.violationsMap = new Map([
        [headingRange, violation({ range: headingRange, severity: 'warning' })],
      ]);
      await headingStructure.updateComplete;

      expect(toggle(headingStructure)!.identifier).toBe('editor');
      expect(toggle(headingStructure)!.entries.map(([range]) => range)).toEqual([headingRange]);
      expect(toggle(headingStructure)!.closest('button')).toBeNull();
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

    it('asks to focus the validation of the clicked heading, like its Focus button', async () => {
      const { headingStructure, root } = await setupWithContent('<h1>Titel</h1>');
      headingStructure.identifier = 'editor';
      const headingRange = document.createRange();
      headingRange.selectNode(root.querySelector('h1')!);
      headingStructure.violationsMap = new Map([
        [headingRange, violation({ range: headingRange, severity: 'warning' })],
      ]);
      await headingStructure.updateComplete;

      headingStructure.shadowRoot!.querySelector('button')!.click();

      expect(details).toEqual([{ identifier: 'editor', range: headingRange }]);
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
