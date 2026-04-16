import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { ValidationsMap } from '../../../types/validation.ts';
import type { Context } from '../../context';
import type { LinkList } from './index.ts';
import '../../context/index.ts';
import '../../content/index.ts';
import './index.ts';
import { CustomEvents } from '../../../events';

async function setupWithContent(contentHtml: string): Promise<{ linkList: LinkList; contextEl: Context }> {
  document.body.innerHTML = `
    <clippy-context id="link-list-test">
      <div slot="value" hidden>${contentHtml}</div>
      <clippy-content></clippy-content>
      <clippy-link-list></clippy-link-list>
    </clippy-context>
  `;

  const linkList = document.querySelector('clippy-link-list') as unknown as LinkList;
  const contextEl = document.querySelector('clippy-context') as unknown as Context;

  await expect.poll(() => linkList.shadowRoot?.querySelector('nav')).not.toBeNull();

  return { contextEl, linkList };
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

      await expect.poll(() => linkList.shadowRoot?.querySelector('.clippy-link-list__empty')).not.toBeNull();
      expect(linkList.shadowRoot?.querySelector('.clippy-link-list__empty')?.textContent?.trim()).toContain(
        'Geen links gevonden in dit document.',
      );
    });

    it('does not render any list items in the empty state', async () => {
      const { linkList } = await setupWithContent('<h1>Titel</h1>');

      await expect.poll(() => linkList.shadowRoot?.querySelectorAll('.clippy-link-list__item').length).toBe(0);
    });
  });

  describe('link entries', () => {
    it('renders one list item for a single link', async () => {
      const { linkList } = await setupWithContent('<h1>Titel</h1><p><a href="https://example.com">Bezoek ons</a></p>');

      await expect.poll(() => linkList.shadowRoot?.querySelectorAll('.clippy-link-list__item').length).toBe(1);
    });

    it('renders one list item per unique link when multiple links are present', async () => {
      const { linkList } = await setupWithContent(
        '<h1>Titel</h1><p>' +
          '<a href="https://example.com">Voorbeeld</a> en ' +
          '<a href="https://another.example.com">Nog een</a>' +
          '</p>',
      );

      await expect.poll(() => linkList.shadowRoot?.querySelectorAll('.clippy-link-list__item').length).toBe(2);
    });

    it('renders the link text inside the anchor element', async () => {
      const { linkList } = await setupWithContent('<h1>Titel</h1><p><a href="https://example.com">Bezoek ons</a></p>');

      await expect
        .poll(() => linkList.shadowRoot?.querySelector('.clippy-link-list__item .nl-link')?.textContent?.trim())
        .toBe('Bezoek ons');
    });

    it('renders the href as visible text with a matching title attribute', async () => {
      const href = 'https://example.com';
      const { linkList } = await setupWithContent(`<h1>Titel</h1><p><a href="${href}">Lees meer</a></p>`);

      await expect
        .poll(() => linkList.shadowRoot?.querySelector('.clippy-link-list__href')?.textContent?.trim())
        .toBe(href);
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

      await expect
        .poll(() => linkList.shadowRoot?.querySelector('.clippy-link-list__item .nl-link')?.textContent?.trim())
        .toContain('(leeg)');
    });
  });

  // -------------------------------------------------------------------------
  // Consecutive text-node merging
  // -------------------------------------------------------------------------

  describe('consecutive text-node merging', () => {
    it('merges adjacent formatted text nodes that share the same link href into a single entry', async () => {
      // The link contains a bold segment and a plain segment, which TipTap
      // represents as two adjacent text nodes. The component must merge them.
      const { linkList } = await setupWithContent(
        '<h1>Titel</h1><p><a href="https://example.com"><strong>Vet</strong> en normaal</a></p>',
      );

      await expect.poll(() => linkList.shadowRoot?.querySelectorAll('.clippy-link-list__item').length).toBe(1);
    });

    it('renders the merged text of an inline-formatted link correctly', async () => {
      const { linkList } = await setupWithContent(
        '<h1>Titel</h1><p><a href="https://example.com"><strong>Vet</strong> en normaal</a></p>',
      );

      await expect
        .poll(() => linkList.shadowRoot?.querySelector('.clippy-link-list__item .nl-link')?.textContent)
        .toContain('Vet');
      expect(linkList.shadowRoot?.querySelector('.clippy-link-list__item .nl-link')?.textContent).toContain(
        'en normaal',
      );
    });
  });

  // -------------------------------------------------------------------------
  // Validation badges
  // -------------------------------------------------------------------------

  describe('validation badges', () => {
    it('does not render a badge when no validation entry matches the link position', async () => {
      const { linkList } = await setupWithContent(
        '<h1>Titel</h1><p><a href="https://example.com">Link zonder melding</a></p>',
      );

      // Wait for the link item to appear, then confirm no badge is shown.
      await expect.poll(() => linkList.shadowRoot?.querySelectorAll('.clippy-link-list__item').length).toBe(1);
      expect(linkList.shadowRoot?.querySelector('.nl-data-badge')).toBeNull();
    });

    it('renders a severity badge when a validation entry exists at the link text position', async () => {
      // Document: <h1>Titel</h1><p><a href="...">Klik hier</a></p>
      //
      // ProseMirror position calculation:
      //   h1 opens at pos 0, "Titel" = 5 chars, h1.nodeSize = 7  -> next block at pos 7
      //   p  opens at pos 7, link text starts at pos 8 (after the paragraph open token)
      const linkTextPos = 8;

      const { contextEl, linkList } = await setupWithContent(
        '<h1>Titel</h1><p><a href="https://example.com">Klik hier</a></p>',
      );

      const validationsMap: ValidationsMap = new Map([
        [`link-should-not-be-too-generic_${linkTextPos}`, { boundingBox: null, pos: linkTextPos, severity: 'warning' }],
      ]);

      contextEl.updateValidationsContext(validationsMap);
      await contextEl.updateComplete;
      linkList.requestUpdate();

      await expect.poll(() => linkList.shadowRoot?.querySelector('.nl-data-badge')).not.toBeNull();
      expect(
        linkList.shadowRoot?.querySelector('.nl-data-badge')?.classList.contains('clippy-link-list__badge--warning'),
      ).toBe(true);
    });

    it('renders a badge for the highest-severity validation when multiple entries share the same position', async () => {
      const linkTextPos = 8;

      const { contextEl, linkList } = await setupWithContent(
        '<h1>Titel</h1><p><a href="https://example.com">Klik hier</a></p>',
      );

      // Two entries at the same position: error takes precedence over warning.
      const validationsMap: ValidationsMap = new Map([
        [`link-should-not-be-too-generic_${linkTextPos}`, { boundingBox: null, pos: linkTextPos, severity: 'warning' }],
        [`mark-should-not-be-empty_${linkTextPos}`, { boundingBox: null, pos: linkTextPos, severity: 'error' }],
      ]);

      contextEl.updateValidationsContext(validationsMap);
      await contextEl.updateComplete;
      linkList.requestUpdate();

      await expect.poll(() => linkList.shadowRoot?.querySelector('.nl-data-badge')).not.toBeNull();
      expect(
        linkList.shadowRoot?.querySelector('.nl-data-badge')?.classList.contains('clippy-link-list__badge--error'),
      ).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // Interactivity
  // -------------------------------------------------------------------------

  describe('interactivity', () => {
    it('renders each link entry as an anchor with href="#"', async () => {
      const { linkList } = await setupWithContent('<h1>Titel</h1><p><a href="https://example.com">Testlink</a></p>');

      await expect
        .poll(() => linkList.shadowRoot?.querySelectorAll('.clippy-link-list__item .nl-link').length)
        .toBeGreaterThan(0);
      for (const anchor of Array.from(
        linkList.shadowRoot?.querySelectorAll('.clippy-link-list__item .nl-link') ?? [],
      )) {
        expect(anchor.getAttribute('href')).toBe('#');
      }
    });

    it('prevents default browser navigation when a link entry is clicked', async () => {
      const { linkList } = await setupWithContent('<h1>Titel</h1><p><a href="https://example.com">Klik test</a></p>');

      await expect.poll(() => linkList.shadowRoot?.querySelector('.clippy-link-list__item .nl-link')).not.toBeNull();

      const anchor = linkList.shadowRoot!.querySelector('.clippy-link-list__item .nl-link') as HTMLAnchorElement;

      let defaultPrevented = false;
      anchor.addEventListener('click', (e) => {
        defaultPrevented = e.defaultPrevented;
      });

      anchor.click();

      expect(defaultPrevented).toBe(true);
    });

    it('dispatches FOCUS_VALIDATION_ITEM_IN_GUTTER with the validation key when clicking a link that has a validation entry', async () => {
      const linkTextPos = 8;
      const validationKey = `link-should-not-be-too-generic_${linkTextPos}`;

      const { contextEl, linkList } = await setupWithContent(
        '<h1>Titel</h1><p><a href="https://example.com">Klik hier</a></p>',
      );

      const validationsMap: ValidationsMap = new Map([
        [validationKey, { boundingBox: null, pos: linkTextPos, severity: 'warning' }],
      ]);

      contextEl.updateValidationsContext(validationsMap);
      await contextEl.updateComplete;
      linkList.requestUpdate();

      await expect.poll(() => linkList.shadowRoot?.querySelector('.clippy-link-list__item .nl-link')).not.toBeNull();

      let receivedKey: string | undefined;
      const handler = (e: Event) => {
        receivedKey = (e as CustomEvent<{ key: string }>).detail.key;
      };
      globalThis.addEventListener(CustomEvents.FOCUS_VALIDATION_ITEM_IN_GUTTER, handler);

      const anchor = linkList.shadowRoot!.querySelector('.clippy-link-list__item .nl-link') as HTMLAnchorElement;
      anchor.click();

      expect(receivedKey).toBe(validationKey);

      globalThis.removeEventListener(CustomEvents.FOCUS_VALIDATION_ITEM_IN_GUTTER, handler);
    });

    it('does not dispatch FOCUS_VALIDATION_ITEM_IN_GUTTER when the clicked link has no validation entry', async () => {
      const { linkList } = await setupWithContent('<h1>Titel</h1><p><a href="https://example.com">Schone link</a></p>');

      await expect.poll(() => linkList.shadowRoot?.querySelector('.clippy-link-list__item .nl-link')).not.toBeNull();

      let eventFired = false;
      const handler = () => {
        eventFired = true;
      };
      globalThis.addEventListener(CustomEvents.FOCUS_VALIDATION_ITEM_IN_GUTTER, handler);

      const anchor = linkList.shadowRoot!.querySelector('.clippy-link-list__item .nl-link') as HTMLAnchorElement;
      anchor.click();

      expect(eventFired).toBe(false);

      globalThis.removeEventListener(CustomEvents.FOCUS_VALIDATION_ITEM_IN_GUTTER, handler);
    });
  });
});
