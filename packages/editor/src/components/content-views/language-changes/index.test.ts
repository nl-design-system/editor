import { waitFor } from '@testing-library/dom';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { page } from 'vitest/browser';
import { CustomEvents, type FocusNodeDetail } from '@/events';
import { initializeLocale } from '@/localization';
import type { LanguageChanges } from './index';
import './index';

async function setupWithContent(contentHtml: string): Promise<{ langChanges: LanguageChanges }> {
  const root = document.body.appendChild(document.createElement('div'));
  root.innerHTML = contentHtml;
  const langChanges = document.body.appendChild(document.createElement('clippy-language-changes'));
  langChanges.htmlDocument = root;

  await waitFor(() => expect(langChanges.shadowRoot?.querySelector('nav')).not.toBeNull());

  await initializeLocale();
  await langChanges.updateComplete;

  return { langChanges };
}

describe('<clippy-language-changes>', () => {
  beforeEach(() => {
    document.documentElement.lang = 'nl';
  });

  afterEach(() => {
    document.body.innerHTML = '';
    document.documentElement.removeAttribute('lang');
  });

  describe('empty state', () => {
    it('shows the empty-state message when the document contains no lang-annotated blocks', async () => {
      const { langChanges } = await setupWithContent('<h1>Titel</h1><p>Gewone paragraaf zonder taalkenmerk.</p>');

      await waitFor(() =>
        expect(langChanges.shadowRoot?.querySelector('.clippy-language-changes__empty')).not.toBeNull(),
      );
      expect(langChanges.shadowRoot?.querySelector('.clippy-language-changes__empty')?.textContent?.trim()).toContain(
        'Geen taalwijzigingen gevonden in dit document.',
      );
    });

    it('does not render any list items in the empty state', async () => {
      const { langChanges } = await setupWithContent('<h1>Titel</h1>');

      await waitFor(() =>
        expect(langChanges.shadowRoot?.querySelectorAll('.clippy-language-changes__item').length).toBe(0),
      );
    });
  });

  describe('language entries', () => {
    it('renders one list item for a single language change', async () => {
      const { langChanges } = await setupWithContent('<h1>Titel</h1><p lang="en">English paragraph.</p>');

      await waitFor(() =>
        expect(langChanges.shadowRoot?.querySelectorAll('.clippy-language-changes__item').length).toBe(1),
      );
    });

    it('renders one list item per language change when multiple blocks have different langs', async () => {
      const { langChanges } = await setupWithContent(
        '<h1>Titel</h1><p lang="en">English.</p><p lang="fr">Français.</p>',
      );

      await waitFor(() =>
        expect(langChanges.shadowRoot?.querySelectorAll('.clippy-language-changes__item').length).toBe(2),
      );
    });

    it('renders list items in document order', async () => {
      const { langChanges } = await setupWithContent(
        '<h1>Titel</h1><p lang="en">English.</p><p lang="de">Deutsch.</p><p lang="fr">Français.</p>',
      );

      await waitFor(() =>
        expect(
          Array.from(
            langChanges.shadowRoot?.querySelectorAll('.clippy-language-changes__item .nl-data-badge') ?? [],
          ).map((b) => b.textContent?.trim()),
        ).toEqual(['en', 'de', 'fr']),
      );
    });

    it('does not emit a duplicate entry when consecutive blocks share the same language', async () => {
      const { langChanges } = await setupWithContent(
        '<h1>Titel</h1><p lang="en">First English.</p><p lang="en">Second English.</p>',
      );

      // Only one change: ambient lang → 'en'. The second 'en' block is skipped.
      await waitFor(() =>
        expect(langChanges.shadowRoot?.querySelectorAll('.clippy-language-changes__item').length).toBe(1),
      );
    });
  });

  describe('document language', () => {
    it('shows the document language first', async () => {
      const { langChanges } = await setupWithContent('<p lang="en">Hello</p>');

      const documentLanguage = langChanges.shadowRoot!.querySelector('.clippy-language-changes__document-language')!;
      expect(documentLanguage.querySelector('.nl-data-badge')?.textContent?.trim()).toBe('nl');
      expect(documentLanguage.textContent).toContain('Documenttaal');
      expect(
        documentLanguage.compareDocumentPosition(
          langChanges.shadowRoot!.querySelector('.clippy-language-changes__item')!,
        ) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    });

    it('shows the document language when there are no language changes', async () => {
      const { langChanges } = await setupWithContent('<p>Alleen Nederlands</p>');

      expect(
        langChanges
          .shadowRoot!.querySelector('.clippy-language-changes__document-language .nl-data-badge')
          ?.textContent?.trim(),
      ).toBe('nl');
    });

    it('says when the document has no language', async () => {
      document.documentElement.removeAttribute('lang');
      const { langChanges } = await setupWithContent('<p>Tekst</p>');

      expect(
        langChanges.shadowRoot!.querySelector('.clippy-language-changes__document-language')?.textContent,
      ).toContain('Niet ingesteld');
    });
  });

  describe('document-language label', () => {
    it('shows the "(documenttaal)" label when a block language reverts to the document language', async () => {
      const { langChanges } = await setupWithContent(
        '<h1>Titel</h1><p lang="en">English.</p><p lang="nl">Terug naar Nederlands.</p>',
      );

      await waitFor(() =>
        expect(langChanges.shadowRoot?.querySelectorAll('.clippy-language-changes__doc-label').length).toBeGreaterThan(
          0,
        ),
      );
      expect(
        langChanges.shadowRoot?.querySelectorAll('.clippy-language-changes__doc-label')[0]?.textContent?.trim(),
      ).toContain('(documenttaal)');
    });
  });

  describe('preview text', () => {
    it('shows the full block text when it is within the 20-character preview limit', async () => {
      const shortText = 'Short text';
      const { langChanges } = await setupWithContent(`<h1>Titel</h1><p lang="en">${shortText}</p>`);

      await waitFor(() =>
        expect(
          langChanges.shadowRoot?.querySelector('.clippy-language-changes__item .nl-link')?.textContent?.trim(),
        ).toBe(shortText),
      );
      expect(
        langChanges.shadowRoot?.querySelector('.clippy-language-changes__item .nl-link')?.textContent,
      ).not.toContain('…');
    });

    it('truncates block text exceeding 20 characters and appends an ellipsis', async () => {
      const longText = 'This text is definitely longer than twenty characters.';
      const { langChanges } = await setupWithContent(`<h1>Titel</h1><p lang="en">${longText}</p>`);

      await waitFor(() =>
        expect(langChanges.shadowRoot?.querySelector('.clippy-language-changes__item .nl-link')?.textContent).toContain(
          '…',
        ),
      );

      const content =
        langChanges.shadowRoot?.querySelector('.clippy-language-changes__item .nl-link')?.textContent ?? '';
      // The visible text before the ellipsis must equal exactly the first 20 characters.
      expect(content.replace('…', '').trim()).toBe(longText.slice(0, 20));
    });

    it('shows "(leeg)" when the language-annotated block is empty', async () => {
      const { langChanges } = await setupWithContent('<h1>Titel</h1><p lang="en"></p>');

      await waitFor(() =>
        expect(
          langChanges.shadowRoot?.querySelector('.clippy-language-changes__item .nl-link')?.textContent?.trim(),
        ).toContain('(leeg)'),
      );
    });
  });

  describe('guideline', () => {
    it('has a heading and a link to the guidelines in a new tab', async () => {
      await setupWithContent('<p lang="en">Hello</p>');

      await expect.element(page.getByRole('heading', { name: 'Taalwijzigingen', level: 3 })).toBeVisible();
      const link = page.getByRole('link', { name: 'Richtlijnen voor het instellen van de juiste taal' });
      await expect
        .element(link)
        .toHaveAttribute('href', 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/taal/');
      await expect.element(link).toHaveAttribute('target', '_blank');
    });
  });

  describe('interactivity', () => {
    it('asks to focus the clicked language change, like a Focus button', async () => {
      const { langChanges } = await setupWithContent('<p>Intro</p><p lang="en">Hello</p>');
      langChanges.identifier = 'editor';
      await langChanges.updateComplete;
      const details: FocusNodeDetail[] = [];
      const record = (event: Event) => details.push((event as CustomEvent<FocusNodeDetail>).detail);
      globalThis.addEventListener(CustomEvents.FOCUS_NODE, record);

      langChanges.shadowRoot!.querySelector<HTMLAnchorElement>('a.nl-link')!.click();

      globalThis.removeEventListener(CustomEvents.FOCUS_NODE, record);
      expect(details).toHaveLength(1);
      expect(details[0].identifier).toBe('editor');
      expect(details[0].range.startContainer).toBe(langChanges.htmlDocument!.querySelector('[lang="en"]'));
      expect(details[0].range.startOffset).toBe(0);
    });
  });
});
