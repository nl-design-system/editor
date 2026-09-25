import { coreValidationRules, coreValidations } from '@nl-design-system-community/clippy-a11y-validator';
import { beforeEach, describe, expect, it } from 'vitest';
import type { PageViolation, SourceRegistration } from './types';
import { ClippyPage } from './index';

const {
  HEADING_LEVEL_MUST_NOT_SKIP,
  HEADING_MUST_NOT_BE_EMPTY,
  IMAGE_MUST_HAVE_ALT_TEXT,
  PARAGRAPH_SHOULD_NOT_BE_EMPTY,
} = coreValidationRules;

const createSource = (html: string) => {
  const anchor = document.createElement('div');
  anchor.innerHTML = html;
  document.body.append(anchor);
  return { anchor, fragment: anchor, label: 'Body' };
};

const validationPass = async () => {
  await Promise.resolve();
  await new Promise((resolve) => setTimeout(resolve));
};

let page: ClippyPage;

beforeEach(() => {
  document.body.replaceChildren();
  page = new ClippyPage();
  page.registerValidation(coreValidations[PARAGRAPH_SHOULD_NOT_BE_EMPTY]);
});

describe('ClippyPage', () => {
  it('reports violations in a registered source fragment', async () => {
    const { id } = page.register(createSource('<p></p>'));
    await validationPass();

    expect(page.violations.map(({ rule, source }) => ({ rule, source }))).toEqual([
      { rule: PARAGRAPH_SHOULD_NOT_BE_EMPTY, source: id },
    ]);
  });

  it('revalidates a source fragment when elements in it change', async () => {
    const source = createSource('<p>Tekst</p>');
    page.register(source);

    source.fragment.innerHTML = '<p></p>';
    await validationPass();

    expect(page.violations.map(({ rule }) => rule)).toEqual([PARAGRAPH_SHOULD_NOT_BE_EMPTY]);
  });

  it('revalidates a source fragment when text in it changes', async () => {
    const source = createSource('<p>Tekst</p>');
    page.register(source);

    (source.fragment.querySelector('p')!.firstChild as Text).data = '';
    await validationPass();

    expect(page.violations.map(({ rule }) => rule)).toEqual([PARAGRAPH_SHOULD_NOT_BE_EMPTY]);
  });

  it('revalidates a source fragment when an attribute in it changes', async () => {
    page.registerValidation(coreValidations[IMAGE_MUST_HAVE_ALT_TEXT]);
    const source = createSource('<img src="logo.png" alt="Logo">');
    page.register(source);

    source.fragment.querySelector('img')!.removeAttribute('alt');
    await validationPass();

    expect(page.violations.map(({ rule }) => rule)).toEqual([IMAGE_MUST_HAVE_ALT_TEXT]);
  });

  it('revalidates a detached source fragment when it changes', async () => {
    const fragment = document.createElement('div');
    fragment.innerHTML = '<p>Titel</p>';
    page.register({ anchor: document.body, fragment, label: 'Title' });

    fragment.querySelector('p')!.textContent = '';
    await validationPass();

    expect(page.violations.map(({ rule }) => rule)).toEqual([PARAGRAPH_SHOULD_NOT_BE_EMPTY]);
  });

  it('drops the violations of an unregistered source', async () => {
    const { id: kept } = page.register(createSource('<p></p>'));
    const { unregister } = page.register(createSource('<p></p>'));
    await validationPass();

    unregister();
    await validationPass();

    expect(page.violations.map(({ source }) => source)).toEqual([kept]);
  });

  it('records which source every violation came from', async () => {
    const { id: title } = page.register(createSource('<p></p>'));
    const { id: body } = page.register(createSource('<p>Tekst</p><p></p><p></p>'));
    await validationPass();

    // 1 empty paragraph error on the title, 2 empty paragraphs on the body
    expect(page.violations.map(({ source }) => source)).toEqual([title, body, body]);
  });

  it('stops observing a source fragment once the source unregisters', async () => {
    page.register(createSource('<p>Tekst</p>'));
    const source = createSource('<p>Tekst</p>');
    const { unregister } = page.register(source);
    unregister();
    await validationPass();
    const updates: unknown[] = [];
    page.subscribe((violations) => updates.push(violations));

    source.fragment.innerHTML = '<p></p>';
    await validationPass();

    expect(updates).toEqual([]);
  });

  it('returns only an id and an unregister', () => {
    expect(Object.keys(page.register(createSource('<p></p>'))).sort()).toEqual(['id', 'unregister']);
  });

  it('generates a distinct id for every source and ignores one supplied by the host', () => {
    const registration = { ...createSource('<p></p>'), id: 'body' } as SourceRegistration;

    const ids = [page.register(registration).id, page.register(registration).id];

    expect(new Set(ids).size).toBe(2);
    expect(ids).not.toContain('body');
  });

  it('validates registered sources against a validation registered afterwards', async () => {
    page.register(createSource('<h1></h1>'));
    await validationPass();

    page.registerValidation(coreValidations[HEADING_MUST_NOT_BE_EMPTY]);
    await validationPass();

    expect(page.violations.map(({ rule }) => rule)).toEqual([HEADING_MUST_NOT_BE_EMPTY]);
  });

  it('drops the violations of an unregistered validation', async () => {
    const unregisterValidation = page.registerValidation(coreValidations[HEADING_MUST_NOT_BE_EMPTY]);
    page.register(createSource('<h1></h1><p></p>'));
    await validationPass();

    unregisterValidation();
    await validationPass();

    expect(page.violations.map(({ rule }) => rule)).toEqual([PARAGRAPH_SHOULD_NOT_BE_EMPTY]);
  });

  it('notifies subscribers with the current violations when they change', async () => {
    const updates: string[][] = [];
    page.subscribe((violations) => updates.push(violations.map(({ rule }) => rule)));

    page.register(createSource('<p></p>'));
    await validationPass();

    expect(updates).toEqual([[PARAGRAPH_SHOULD_NOT_BE_EMPTY]]);
  });

  describe('composed view across sources', () => {
    const reportedViolations = () => page.violations.map(({ element, rule, source }) => ({ element, rule, source }));

    beforeEach(() => {
      page.registerValidation(coreValidations[HEADING_LEVEL_MUST_NOT_SKIP]);
    });

    it('accepts a heading sequence that continues correctly from one source into the next', async () => {
      page.register(createSource('<h1>Titel</h1>'));
      page.register(createSource('<h2>Kop</h2><h3>Subkop</h3>'));
      await validationPass();

      expect(page.violations).toEqual([]);
    });

    it('reads a detached proxy fragment in the place of its anchor', async () => {
      const input = document.createElement('input');
      document.body.append(input);
      const body = createSource('<h3>Kop</h3>');
      const { id } = page.register(body);
      const fragment = document.createElement('div');
      fragment.innerHTML = '<h1>Titel</h1>';

      page.register({ anchor: input, fragment, label: 'Title' });
      await validationPass();

      expect(reportedViolations()).toEqual([
        { element: body.fragment.querySelector('h3'), rule: HEADING_LEVEL_MUST_NOT_SKIP, source: id },
      ]);
    });

    it('recomputes the order when a source registers between two others', async () => {
      page.register(createSource('<h1>Titel</h1>'));
      const intro = createSource('<h2>Intro</h2>');
      page.register(createSource('<h3>Kop</h3>'));

      page.register(intro);
      await validationPass();

      expect(page.violations).toEqual([]);
    });

    it('records the source that owns each element, in page order', async () => {
      const intro = createSource('<h1>Titel</h1><h3>Intro</h3>');
      const body = createSource('<h5>Kop</h5>');

      const { id: bodyId } = page.register(body);
      const { id: introId } = page.register(intro);
      await validationPass();

      expect(reportedViolations()).toEqual([
        { element: intro.fragment.querySelector('h3'), rule: HEADING_LEVEL_MUST_NOT_SKIP, source: introId },
        { element: body.fragment.querySelector('h5'), rule: HEADING_LEVEL_MUST_NOT_SKIP, source: bodyId },
      ]);
    });
  });

  describe('scheduling', () => {
    it('emits one update for several registrations arriving together', async () => {
      const updates: (readonly PageViolation[])[] = [];
      page.subscribe((violations) => updates.push(violations));

      page.register(createSource('<p></p>'));
      page.register(createSource('<p></p>'));
      await validationPass();

      expect(updates.map((violations) => violations.length)).toEqual([2]);
    });

    it('emits one update for mutations in several sources arriving together', async () => {
      const title = createSource('<p>Titel</p>');
      const body = createSource('<p>Tekst</p>');
      page.register(title);
      page.register(body);
      await validationPass();
      const updates: (readonly PageViolation[])[] = [];
      page.subscribe((violations) => updates.push(violations));

      title.fragment.innerHTML = '<p></p>';
      body.fragment.innerHTML = '<p></p>';
      await validationPass();

      expect(updates.map((violations) => violations.length)).toEqual([2]);
    });

    it('emits one update when a mutation and a registration arrive together', async () => {
      const body = createSource('<p>Tekst</p>');
      page.register(body);
      await validationPass();
      const updates: (readonly PageViolation[])[] = [];
      page.subscribe((violations) => updates.push(violations));

      body.fragment.innerHTML = '<p></p>';
      page.register(createSource('<p></p>'));
      await validationPass();

      expect(updates.map((violations) => violations.length)).toEqual([2]);
    });
  });

  describe('mutations that are not content', () => {
    it('does not update again when a view writes into an observed fragment', async () => {
      const body = createSource('<p>Tekst</p>');
      page.register(body);
      await validationPass();
      const updates: (readonly PageViolation[])[] = [];
      page.subscribe((violations) => {
        updates.push(violations);
        violations.forEach(({ element }) => element.setAttribute('data-highlight', ''));
        body.fragment.append(document.createElement('mark'));
      });

      body.fragment.querySelector('p')!.textContent = '';
      await validationPass();
      await validationPass();

      expect(updates.map((violations) => violations.length)).toEqual([1]);
    });

    it('does not update when a mutation leaves the violations unchanged', async () => {
      const body = createSource('<p></p><p>Tekst</p>');
      page.register(body);
      await validationPass();
      const updates: unknown[] = [];
      page.subscribe((violations) => updates.push(violations));

      body.fragment.querySelectorAll('p')[1].textContent = 'Andere tekst';
      await validationPass();

      expect(updates).toEqual([]);
    });

    it('updates when the violations move to other elements without changing in number', async () => {
      const body = createSource('<p></p><p>Tekst</p>');
      page.register(body);
      await validationPass();
      const updates: (readonly PageViolation[])[] = [];
      page.subscribe((violations) => updates.push(violations));

      const [first, second] = body.fragment.querySelectorAll('p');
      first.textContent = 'Tekst';
      second.textContent = '';
      await validationPass();

      expect(updates.map((violations) => violations.map(({ element }) => element))).toEqual([[second]]);
    });

    it('updates when only the payload of a violation changes', async () => {
      page.registerValidation(coreValidations[HEADING_LEVEL_MUST_NOT_SKIP]);
      const body = createSource('<h1>Titel</h1><h4>Kop</h4>');
      page.register(body);
      await validationPass();
      const updates: (readonly PageViolation[])[] = [];
      page.subscribe((violations) => updates.push(violations));

      body.fragment.querySelector('h1')!.outerHTML = '<h2>Titel</h2>';
      await validationPass();

      expect(updates).toHaveLength(1);
    });

    it('emits one update for a burst of editor mutations from one keystroke', async () => {
      const body = createSource('<p>Tekst</p><p>Meer</p>');
      page.register(body);
      await validationPass();
      const updates: (readonly PageViolation[])[] = [];
      page.subscribe((violations) => updates.push(violations));

      const [first, second] = body.fragment.querySelectorAll('p');
      first.textContent = '';
      first.classList.add('ck-placeholder');
      first.setAttribute('data-placeholder', 'Typ hier');
      second.append(document.createElement('br'));
      body.fragment.setAttribute('aria-activedescendant', '');
      await validationPass();

      expect(updates.map((violations) => violations.length)).toEqual([1]);
    });

    it('revalidates a source whose fragment is a shadow root', async () => {
      const host = document.createElement('div');
      document.body.append(host);
      const shadowRoot = host.attachShadow({ mode: 'open' });
      shadowRoot.innerHTML = '<p>Tekst</p>';
      const { id } = page.register({ anchor: host, fragment: shadowRoot, label: 'Component' });
      await validationPass();

      shadowRoot.querySelector('p')!.textContent = '';
      await validationPass();

      expect(page.violations.map(({ rule, source }) => ({ rule, source }))).toEqual([
        { rule: PARAGRAPH_SHOULD_NOT_BE_EMPTY, source: id },
      ]);
    });
  });

  describe('source lifecycle', () => {
    it('revalidates the recomposed page when a source unregisters', async () => {
      page.registerValidation(coreValidations[HEADING_LEVEL_MUST_NOT_SKIP]);
      page.register(createSource('<h1>Titel</h1>'));
      const { unregister } = page.register(createSource('<h2>Intro</h2>'));
      const { id } = page.register(createSource('<h3>Kop</h3>'));
      await validationPass();

      unregister();
      await validationPass();

      expect(page.violations.map(({ rule, source }) => ({ rule, source }))).toEqual([
        { rule: HEADING_LEVEL_MUST_NOT_SKIP, source: id },
      ]);
    });

    it('drops a source whose anchor is disconnected without unregistering', async () => {
      const removed = createSource('<p></p>');
      page.register(removed);
      const body = createSource('<p>Tekst</p>');
      const { id } = page.register(body);
      await validationPass();

      removed.anchor.remove();
      body.fragment.querySelector('p')!.textContent = '';
      await validationPass();

      expect(page.violations.map(({ source }) => source)).toEqual([id]);
    });
  });

  it('stops notifying a subscriber once it unsubscribes', async () => {
    const updates: unknown[] = [];
    const unsubscribe = page.subscribe((violations) => updates.push(violations));

    unsubscribe();
    page.register(createSource('<p></p>'));
    await validationPass();

    expect(updates).toEqual([]);
  });
});
