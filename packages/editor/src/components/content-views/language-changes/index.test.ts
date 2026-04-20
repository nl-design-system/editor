import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { Context } from '../../context';
import type { LanguageChanges } from './index.ts';
import '../../context/index.ts';
import '../../content/index.ts';
import './index.ts';

async function setupWithContent(
  contentHtml: string,
  mountEditor = false,
): Promise<{ langChanges: LanguageChanges; contextEl: Context }> {
  document.body.innerHTML = `
    <clippy-context id="language-changes-test">
      <div slot="value" hidden>${contentHtml}</div>
      ${mountEditor ? '<clippy-content></clippy-content>' : ''}
      <clippy-language-changes></clippy-language-changes>
    </clippy-context>
  `;

  const langChanges = document.querySelector('clippy-language-changes') as unknown as LanguageChanges;
  const contextEl = document.querySelector('clippy-context') as unknown as Context;

  // Wait until Lit has performed at least one render cycle and the shadow root
  // contains the <nav> element.
  await expect.poll(() => langChanges.shadowRoot?.querySelector('nav')).not.toBeNull();

  return { contextEl, langChanges };
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

      await expect.poll(() => langChanges.shadowRoot?.querySelector('.clippy-language-changes__empty')).not.toBeNull();
      expect(langChanges.shadowRoot?.querySelector('.clippy-language-changes__empty')?.textContent?.trim()).toContain(
        'Geen taalwijzigingen gevonden in dit document.',
      );
    });

    it('does not render any list items in the empty state', async () => {
      const { langChanges } = await setupWithContent('<h1>Titel</h1>');

      await expect
        .poll(() => langChanges.shadowRoot?.querySelectorAll('.clippy-language-changes__item').length)
        .toBe(0);
    });
  });

  describe('language entries', () => {
    it('renders one list item for a single language change', async () => {
      const { langChanges } = await setupWithContent('<h1>Titel</h1><p lang="en">English paragraph.</p>');

      await expect
        .poll(() => langChanges.shadowRoot?.querySelectorAll('.clippy-language-changes__item').length)
        .toBe(1);
    });

    it('renders one list item per language change when multiple blocks have different langs', async () => {
      const { langChanges } = await setupWithContent(
        '<h1>Titel</h1><p lang="en">English.</p><p lang="fr">Français.</p>',
      );

      await expect
        .poll(() => langChanges.shadowRoot?.querySelectorAll('.clippy-language-changes__item').length)
        .toBe(2);
    });

    it('renders list items in document order', async () => {
      const { langChanges } = await setupWithContent(
        '<h1>Titel</h1><p lang="en">English.</p><p lang="de">Deutsch.</p><p lang="fr">Français.</p>',
      );

      await expect
        .poll(() =>
          Array.from(
            langChanges.shadowRoot?.querySelectorAll('.clippy-language-changes__item .nl-data-badge') ?? [],
          ).map((b) => b.textContent?.trim()),
        )
        .toEqual(['en', 'de', 'fr']);
    });

    it('does not emit a duplicate entry when consecutive blocks share the same language', async () => {
      const { langChanges } = await setupWithContent(
        '<h1>Titel</h1><p lang="en">First English.</p><p lang="en">Second English.</p>',
      );

      // Only one change: ambient lang → 'en'. The second 'en' block is skipped.
      await expect
        .poll(() => langChanges.shadowRoot?.querySelectorAll('.clippy-language-changes__item').length)
        .toBe(1);
    });
  });

  describe('document-language label', () => {
    it('shows the "(documenttaal)" label when a block language reverts to the document language', async () => {
      const { contextEl, langChanges } = await setupWithContent(
        '<h1>Titel</h1><p lang="en">English.</p><p lang="nl">Terug naar Nederlands.</p>',
        true,
      );

      // After clippy-content mounts the editor, force a re-render so that the
      // docLang DOM traversal can walk up to document.documentElement[lang].
      await contextEl.updateComplete;
      langChanges.requestUpdate();

      await expect
        .poll(() => langChanges.shadowRoot?.querySelectorAll('.clippy-language-changes__doc-label').length)
        .toBeGreaterThan(0);
      expect(
        langChanges.shadowRoot?.querySelectorAll('.clippy-language-changes__doc-label')[0]?.textContent?.trim(),
      ).toContain('(documenttaal)');
    });
  });

  describe('preview text', () => {
    it('shows the full block text when it is within the 20-character preview limit', async () => {
      const shortText = 'Short text';
      const { langChanges } = await setupWithContent(`<h1>Titel</h1><p lang="en">${shortText}</p>`);

      await expect
        .poll(() =>
          langChanges.shadowRoot?.querySelector('.clippy-language-changes__item .nl-link')?.textContent?.trim(),
        )
        .toBe(shortText);
      expect(
        langChanges.shadowRoot?.querySelector('.clippy-language-changes__item .nl-link')?.textContent,
      ).not.toContain('…');
    });

    it('truncates block text exceeding 20 characters and appends an ellipsis', async () => {
      const longText = 'This text is definitely longer than twenty characters.';
      const { langChanges } = await setupWithContent(`<h1>Titel</h1><p lang="en">${longText}</p>`);

      await expect
        .poll(() => langChanges.shadowRoot?.querySelector('.clippy-language-changes__item .nl-link')?.textContent)
        .toContain('…');

      const content =
        langChanges.shadowRoot?.querySelector('.clippy-language-changes__item .nl-link')?.textContent ?? '';
      // The visible text before the ellipsis must equal exactly the first 20 characters.
      expect(content.replace('…', '').trim()).toBe(longText.slice(0, 20));
    });

    it('shows "(leeg)" when the language-annotated block is empty', async () => {
      const { langChanges } = await setupWithContent('<h1>Titel</h1><p lang="en"></p>');

      await expect
        .poll(() =>
          langChanges.shadowRoot?.querySelector('.clippy-language-changes__item .nl-link')?.textContent?.trim(),
        )
        .toContain('(leeg)');
    });
  });
});
