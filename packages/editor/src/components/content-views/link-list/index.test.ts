import { violation } from '@test/violation';
import { waitFor } from '@testing-library/dom';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { page } from 'vitest/browser';
import { CustomEvents, type FocusNodeDetail } from '@/events';
import { initializeLocale } from '@/localization';
import type { LinkList } from './index';
import './index';

async function setupWithContent(contentHtml: string): Promise<{ linkList: LinkList; root: HTMLElement }> {
  const root = document.body.appendChild(document.createElement('div'));
  root.innerHTML = contentHtml;
  const linkList = document.body.appendChild(document.createElement('clippy-link-list'));
  linkList.htmlDocument = root;

  await waitFor(() => expect(linkList.shadowRoot?.querySelector('nav')).not.toBeNull());

  await initializeLocale();
  await linkList.updateComplete;

  return { linkList, root };
}

describe('<clippy-link-list>', () => {
  beforeEach(() => {
    document.documentElement.lang = 'nl';
  });

  afterEach(() => {
    document.body.innerHTML = '';
    document.documentElement.removeAttribute('lang');
  });

  describe('empty state', () => {
    it('shows the empty-state message when the document contains no links', async () => {
      const { linkList } = await setupWithContent('<h1>Titel</h1><p>Paragraaf zonder link.</p>');

      await waitFor(() => expect(linkList.shadowRoot?.querySelector('.clippy-link-list__empty')).not.toBeNull());
      expect(linkList.shadowRoot?.querySelector('.clippy-link-list__empty')?.textContent?.trim()).toContain(
        'Geen links gevonden in dit document.',
      );
    });

    it('does not render any list items in the empty state', async () => {
      const { linkList } = await setupWithContent('<h1>Titel</h1>');

      await waitFor(() => expect(linkList.shadowRoot?.querySelectorAll('.clippy-link-list__item').length).toBe(0));
    });
  });

  describe('link entries', () => {
    it('renders one list item for a single link', async () => {
      const { linkList } = await setupWithContent('<h1>Titel</h1><p><a href="https://example.com">Bezoek ons</a></p>');

      await waitFor(() => expect(linkList.shadowRoot?.querySelectorAll('.clippy-link-list__item').length).toBe(1));
    });

    it('renders one list item per unique link when multiple links are present', async () => {
      const { linkList } = await setupWithContent(
        '<h1>Titel</h1><p>' +
          '<a href="https://example.com">Voorbeeld</a> en ' +
          '<a href="https://another.example.com">Nog een</a>' +
          '</p>',
      );

      await waitFor(() => expect(linkList.shadowRoot?.querySelectorAll('.clippy-link-list__item').length).toBe(2));
    });

    it('renders the link text inside the anchor element', async () => {
      const { linkList } = await setupWithContent('<h1>Titel</h1><p><a href="https://example.com">Bezoek ons</a></p>');

      await waitFor(() =>
        expect(linkList.shadowRoot?.querySelector('.clippy-link-list__item .nl-link')?.textContent?.trim()).toBe(
          'Bezoek ons',
        ),
      );
    });

    it('renders the href as visible text with a matching title attribute', async () => {
      const href = 'https://example.com';
      const { linkList } = await setupWithContent(`<h1>Titel</h1><p><a href="${href}">Lees meer</a></p>`);

      await waitFor(() =>
        expect(linkList.shadowRoot?.querySelector('.clippy-link-list__href')?.textContent?.trim()).toBe(href),
      );
      expect(linkList.shadowRoot?.querySelector('.clippy-link-list__href')?.getAttribute('title')).toBe(href);
    });

    it('omits the href element when the link has an empty href', async () => {
      const { linkList } = await setupWithContent('<h1>Titel</h1><p><a href="">Lege href</a></p>');

      // setupWithContent already confirmed the component has rendered (nav is present).
      // We only care that the href UI element is absent — no need to poll further.
      expect(linkList.shadowRoot?.querySelector('.clippy-link-list__href')).toBeNull();
    });

    it('shows "(leeg)" when the link text is only whitespace', async () => {
      const { linkList } = await setupWithContent(
        '<h1>Titel</h1><p>test with an empty<a href="https://example.com"> </a>link</p>',
      );

      await waitFor(() =>
        expect(linkList.shadowRoot?.querySelector('.clippy-link-list__item .nl-link')?.textContent?.trim()).toContain(
          '(leeg)',
        ),
      );
    });
  });

  // -------------------------------------------------------------------------
  // Consecutive text-node merging
  // -------------------------------------------------------------------------

  describe('consecutive text-node merging', () => {
    it('merges adjacent formatted text nodes that share the same link href into a single entry', async () => {
      const { linkList } = await setupWithContent(
        '<h1>Titel</h1><p><a href="https://example.com"><strong>Vet</strong> en normaal</a></p>',
      );

      await waitFor(() => expect(linkList.shadowRoot?.querySelectorAll('.clippy-link-list__item').length).toBe(1));
    });

    it('renders the merged text of an inline-formatted link correctly', async () => {
      const { linkList } = await setupWithContent(
        '<h1>Titel</h1><p><a href="https://example.com"><strong>Vet</strong> en normaal</a></p>',
      );

      await waitFor(() =>
        expect(linkList.shadowRoot?.querySelector('.clippy-link-list__item .nl-link')?.textContent).toContain('Vet'),
      );
      expect(linkList.shadowRoot?.querySelector('.clippy-link-list__item .nl-link')?.textContent).toContain(
        'en normaal',
      );
    });
  });

  describe('guideline', () => {
    it('has a heading and a link to the guidelines in a new tab', async () => {
      await setupWithContent('<p><a href="/contact">Contact</a></p>');

      await expect.element(page.getByRole('heading', { name: 'Links', level: 3 })).toBeVisible();
      await expect.element(page.getByText(/Dit overzicht toont alle links in de tekst/)).toBeVisible();
      const link = page.getByRole('link', { name: 'Richtlijnen voor toegankelijke linkteksten' });
      await expect
        .element(link)
        .toHaveAttribute('href', 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/linkteksten/');
      await expect.element(link).toHaveAttribute('target', '_blank');
    });
  });

  describe('item', () => {
    it('shows each link in a row, not in a card', async () => {
      const { linkList } = await setupWithContent('<p><a href="/contact">Contact</a> <a href="/over">Over ons</a></p>');

      const items = [...linkList.shadowRoot!.querySelectorAll('.clippy-link-list__item')];
      expect(items).toHaveLength(2);
      expect(linkList.shadowRoot!.querySelector('clippy-card')).toBeNull();
      expect(items[0].querySelector('a')?.textContent?.trim()).toBe('Contact');
    });

    it('marks the row of a link with a validation with its highest severity', async () => {
      const { linkList, root } = await setupWithContent('<p><a href="/contact">Contact</a></p>');
      const range = document.createRange();
      range.selectNodeContents(root.querySelector('a')!);
      linkList.violationsMap = new Map([[range, violation({ range, severity: 'warning' })]]);
      await linkList.updateComplete;

      expect(linkList.shadowRoot!.querySelector('.clippy-link-list__item')).toHaveClass(
        'clippy-link-list__item--warning',
      );
    });
  });

  describe('validation button', () => {
    const validationButton = (linkList: LinkList) => linkList.shadowRoot?.querySelector('clippy-validation-button');

    it('does not render a validation button when no validation matches the link', async () => {
      const { linkList } = await setupWithContent(
        '<h1>Titel</h1><p><a href="https://example.com">Link zonder melding</a></p>',
      );

      await waitFor(() => expect(linkList.shadowRoot?.querySelectorAll('.clippy-link-list__item').length).toBe(1));
      expect(validationButton(linkList)).toBeNull();
    });

    it('renders a validation button with every validation of the link, highest severity first', async () => {
      const { linkList, root } = await setupWithContent(
        '<h1>Titel</h1><p><a href="https://example.com">Klik hier</a></p>',
      );
      const linkEl = root.querySelector('a')!;
      const warningRange = document.createRange();
      warningRange.selectNode(linkEl);
      const errorRange = document.createRange();
      errorRange.selectNode(linkEl);
      linkList.identifier = 'editor';
      linkList.violationsMap = new Map([
        [warningRange, violation({ range: warningRange, severity: 'warning' })],
        [errorRange, violation({ range: errorRange, severity: 'error' })],
      ]);

      await waitFor(() => expect(validationButton(linkList)).not.toBeNull());
      expect(validationButton(linkList)!.identifier).toBe('editor');
      expect(validationButton(linkList)!.violations.map(({ range }) => range)).toEqual([errorRange, warningRange]);
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

    it('asks to focus the clicked link itself, also when it has a validation', async () => {
      const { linkList, root } = await setupWithContent('<p><a href="/contact">Contact</a></p>');
      linkList.identifier = 'editor';
      const linkRange = document.createRange();
      linkRange.selectNode(root.querySelector('a')!);
      linkList.violationsMap = new Map([[linkRange, violation({ range: linkRange, severity: 'warning' })]]);
      await linkList.updateComplete;

      linkList.shadowRoot!.querySelector<HTMLAnchorElement>('a.nl-link')!.click();

      expect(details).toHaveLength(1);
      expect(details[0].range.startContainer).toBe(root.querySelector('a'));
      expect(details[0].range.startOffset).toBe(0);
    });

    it('asks to focus a clicked link without a validation', async () => {
      const { linkList, root } = await setupWithContent('<p><a href="/contact">Contact</a></p>');
      linkList.identifier = 'editor';
      await linkList.updateComplete;

      linkList.shadowRoot!.querySelector<HTMLAnchorElement>('a.nl-link')!.click();

      expect(details).toHaveLength(1);
      expect(details[0].identifier).toBe('editor');
      expect(details[0].range.startContainer).toBe(root.querySelector('a'));
      expect(details[0].range.startOffset).toBe(0);
    });
  });
});
