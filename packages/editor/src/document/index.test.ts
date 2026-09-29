import { coreValidationRules, coreValidations } from '@nl-design-system-community/clippy-a11y-validator';
import { beforeEach, describe, expect, it } from 'vitest';
import type { DocumentViolation, SourceRegistration } from './types';
import { ClippyDocument } from './index';

const {
  HEADING_LEVEL_MUST_NOT_SKIP,
  HEADING_MUST_NOT_BE_EMPTY,
  IMAGE_MUST_HAVE_ALT_TEXT,
  PARAGRAPH_SHOULD_NOT_BE_EMPTY,
  PARAGRAPH_SHOULD_NOT_BE_ENTIRELY_BOLD,
} = coreValidationRules;

const createSource = (html: string) => {
  const anchor = document.createElement('div');
  anchor.innerHTML = html;
  document.body.append(anchor);
  return { anchor, fragment: anchor, label: 'Body' };
};

const prose = (word: string) => `${word} is volledig dikgedrukt en veel te lang om nog als een kop door te gaan.`;
const bold = (word: string) => `<p><strong>${prose(word)}</strong></p>`;

const validationPass = async () => {
  await Promise.resolve();
  await new Promise((resolve) => setTimeout(resolve));
};

let clippyDocument: ClippyDocument;

beforeEach(() => {
  document.body.replaceChildren();
  clippyDocument = new ClippyDocument();
  clippyDocument.registerValidation(coreValidations[PARAGRAPH_SHOULD_NOT_BE_EMPTY]);
});

describe('ClippyDocument', () => {
  it('reports violations in a registered source fragment', async () => {
    const { id } = clippyDocument.register(createSource('<p></p>'));
    await validationPass();

    expect(clippyDocument.violations.map(({ rule, source }) => ({ rule, source }))).toEqual([
      { rule: PARAGRAPH_SHOULD_NOT_BE_EMPTY, source: id },
    ]);
  });

  it('revalidates a source fragment when elements in it change', async () => {
    const source = createSource('<p>Tekst</p>');
    clippyDocument.register(source);

    source.fragment.innerHTML = '<p></p>';
    await validationPass();

    expect(clippyDocument.violations.map(({ rule }) => rule)).toEqual([PARAGRAPH_SHOULD_NOT_BE_EMPTY]);
  });

  it('revalidates a source fragment when text in it changes', async () => {
    const source = createSource('<p>Tekst</p>');
    clippyDocument.register(source);

    (source.fragment.querySelector('p')!.firstChild as Text).data = '';
    await validationPass();

    expect(clippyDocument.violations.map(({ rule }) => rule)).toEqual([PARAGRAPH_SHOULD_NOT_BE_EMPTY]);
  });

  it('revalidates a source fragment when an attribute in it changes', async () => {
    clippyDocument.registerValidation(coreValidations[IMAGE_MUST_HAVE_ALT_TEXT]);
    const source = createSource('<img src="logo.png" alt="Logo">');
    clippyDocument.register(source);

    source.fragment.querySelector('img')!.removeAttribute('alt');
    await validationPass();

    expect(clippyDocument.violations.map(({ rule }) => rule)).toEqual([IMAGE_MUST_HAVE_ALT_TEXT]);
  });

  it('revalidates a detached source fragment when it changes', async () => {
    const fragment = document.createElement('div');
    fragment.innerHTML = '<p>Titel</p>';
    clippyDocument.register({ anchor: document.body, fragment, label: 'Title' });

    fragment.querySelector('p')!.textContent = '';
    await validationPass();

    expect(clippyDocument.violations.map(({ rule }) => rule)).toEqual([PARAGRAPH_SHOULD_NOT_BE_EMPTY]);
  });

  it('drops the violations of an unregistered source', async () => {
    const { id: kept } = clippyDocument.register(createSource('<p></p>'));
    const { unregister } = clippyDocument.register(createSource('<p></p>'));
    await validationPass();

    unregister();
    await validationPass();

    expect(clippyDocument.violations.map(({ source }) => source)).toEqual([kept]);
  });

  it('records which source every violation came from', async () => {
    const { id: title } = clippyDocument.register(createSource('<p></p>'));
    const { id: body } = clippyDocument.register(createSource('<p>Tekst</p><p></p><p></p>'));
    await validationPass();

    // 1 empty paragraph error on the title, 2 empty paragraphs on the body
    expect(clippyDocument.violations.map(({ source }) => source)).toEqual([title, body, body]);
  });

  it('stops observing a source fragment once the source unregisters', async () => {
    clippyDocument.register(createSource('<p>Tekst</p>'));
    const source = createSource('<p>Tekst</p>');
    const { unregister } = clippyDocument.register(source);
    unregister();
    await validationPass();
    const updates: unknown[] = [];
    clippyDocument.subscribe((violations) => updates.push(violations));

    source.fragment.innerHTML = '<p></p>';
    await validationPass();

    expect(updates).toEqual([]);
  });

  it('returns only an id and an unregister', () => {
    expect(Object.keys(clippyDocument.register(createSource('<p></p>'))).sort()).toEqual(['id', 'unregister']);
  });

  it('generates a distinct id for every source and ignores one supplied by the host', () => {
    const registration = { ...createSource('<p></p>'), id: 'body' } as SourceRegistration;

    const ids = [clippyDocument.register(registration).id, clippyDocument.register(registration).id];

    expect(new Set(ids).size).toBe(2);
    expect(ids).not.toContain('body');
  });

  it('validates registered sources against a validation registered afterwards', async () => {
    clippyDocument.register(createSource('<h1></h1>'));
    await validationPass();

    clippyDocument.registerValidation(coreValidations[HEADING_MUST_NOT_BE_EMPTY]);
    await validationPass();

    expect(clippyDocument.violations.map(({ rule }) => rule)).toEqual([HEADING_MUST_NOT_BE_EMPTY]);
  });

  it('drops the violations of an unregistered validation', async () => {
    const unregisterValidation = clippyDocument.registerValidation(coreValidations[HEADING_MUST_NOT_BE_EMPTY]);
    clippyDocument.register(createSource('<h1></h1><p></p>'));
    await validationPass();

    unregisterValidation();
    await validationPass();

    expect(clippyDocument.violations.map(({ rule }) => rule)).toEqual([PARAGRAPH_SHOULD_NOT_BE_EMPTY]);
  });

  it('notifies subscribers with the current violations when they change', async () => {
    const updates: string[][] = [];
    clippyDocument.subscribe((violations) => updates.push(violations.map(({ rule }) => rule)));

    clippyDocument.register(createSource('<p></p>'));
    await validationPass();

    expect(updates).toEqual([[PARAGRAPH_SHOULD_NOT_BE_EMPTY]]);
  });

  describe('composed view across sources', () => {
    const reportedViolations = () =>
      clippyDocument.violations.map(({ element, rule, source }) => ({ element, rule, source }));

    beforeEach(() => {
      clippyDocument.registerValidation(coreValidations[HEADING_LEVEL_MUST_NOT_SKIP]);
    });

    it('accepts a heading sequence that continues correctly from one source into the next', async () => {
      clippyDocument.register(createSource('<h1>Titel</h1>'));
      clippyDocument.register(createSource('<h2>Kop</h2><h3>Subkop</h3>'));
      await validationPass();

      expect(clippyDocument.violations).toEqual([]);
    });

    it('reads a detached proxy fragment in the place of its anchor', async () => {
      const input = document.createElement('input');
      document.body.append(input);
      const body = createSource('<h3>Kop</h3>');
      const { id } = clippyDocument.register(body);
      const fragment = document.createElement('div');
      fragment.innerHTML = '<h1>Titel</h1>';

      clippyDocument.register({ anchor: input, fragment, label: 'Title' });
      await validationPass();

      expect(reportedViolations()).toEqual([
        { element: body.fragment.querySelector('h3'), rule: HEADING_LEVEL_MUST_NOT_SKIP, source: id },
      ]);
    });

    it('recomputes the order when a source registers between two others', async () => {
      clippyDocument.register(createSource('<h1>Titel</h1>'));
      const intro = createSource('<h2>Intro</h2>');
      clippyDocument.register(createSource('<h3>Kop</h3>'));

      clippyDocument.register(intro);
      await validationPass();

      expect(clippyDocument.violations).toEqual([]);
    });

    it('records the label of the source that owns each element', async () => {
      const body = { ...createSource('<p></p>'), label: 'Body' };
      const title = { ...createSource('<p></p>'), label: 'Title' };
      body.anchor.before(title.anchor);

      clippyDocument.register(body);
      clippyDocument.register(title);
      await validationPass();

      expect(clippyDocument.violations.map(({ label }) => label)).toEqual(['Title', 'Body']);
    });

    it('records the source that owns each element, in document order', async () => {
      const intro = createSource('<h1>Titel</h1><h3>Intro</h3>');
      const body = createSource('<h5>Kop</h5>');

      const { id: bodyId } = clippyDocument.register(body);
      const { id: introId } = clippyDocument.register(intro);
      await validationPass();

      expect(reportedViolations()).toEqual([
        { element: intro.fragment.querySelector('h3'), rule: HEADING_LEVEL_MUST_NOT_SKIP, source: introId },
        { element: body.fragment.querySelector('h5'), rule: HEADING_LEVEL_MUST_NOT_SKIP, source: bodyId },
      ]);
    });
  });

  describe('scheduling', () => {
    it('emits one update for several registrations arriving together', async () => {
      const updates: (readonly DocumentViolation[])[] = [];
      clippyDocument.subscribe((violations) => updates.push(violations));

      clippyDocument.register(createSource('<p></p>'));
      clippyDocument.register(createSource('<p></p>'));
      await validationPass();

      expect(updates.map((violations) => violations.length)).toEqual([2]);
    });

    it('emits one update for mutations in several sources arriving together', async () => {
      const title = createSource('<p>Titel</p>');
      const body = createSource('<p>Tekst</p>');
      clippyDocument.register(title);
      clippyDocument.register(body);
      await validationPass();
      const updates: (readonly DocumentViolation[])[] = [];
      clippyDocument.subscribe((violations) => updates.push(violations));

      title.fragment.innerHTML = '<p></p>';
      body.fragment.innerHTML = '<p></p>';
      await validationPass();

      expect(updates.map((violations) => violations.length)).toEqual([2]);
    });

    it('emits one update when a mutation and a registration arrive together', async () => {
      const body = createSource('<p>Tekst</p>');
      clippyDocument.register(body);
      await validationPass();
      const updates: (readonly DocumentViolation[])[] = [];
      clippyDocument.subscribe((violations) => updates.push(violations));

      body.fragment.innerHTML = '<p></p>';
      clippyDocument.register(createSource('<p></p>'));
      await validationPass();

      expect(updates.map((violations) => violations.length)).toEqual([2]);
    });
  });

  describe('mutations that are not content', () => {
    it('does not update again when a view writes into an observed fragment', async () => {
      const body = createSource('<p>Tekst</p>');
      clippyDocument.register(body);
      await validationPass();
      const updates: (readonly DocumentViolation[])[] = [];
      clippyDocument.subscribe((violations) => {
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
      clippyDocument.register(body);
      await validationPass();
      const updates: unknown[] = [];
      clippyDocument.subscribe((violations) => updates.push(violations));

      body.fragment.querySelectorAll('p')[1].textContent = 'Andere tekst';
      await validationPass();

      expect(updates).toEqual([]);
    });

    it('updates when the violations move to other elements without changing in number', async () => {
      const body = createSource('<p></p><p>Tekst</p>');
      clippyDocument.register(body);
      await validationPass();
      const updates: (readonly DocumentViolation[])[] = [];
      clippyDocument.subscribe((violations) => updates.push(violations));

      const [first, second] = body.fragment.querySelectorAll('p');
      first.textContent = 'Tekst';
      second.textContent = '';
      await validationPass();

      expect(updates.map((violations) => violations.map(({ element }) => element))).toEqual([[second]]);
    });

    it('updates when only the payload of a violation changes', async () => {
      clippyDocument.registerValidation(coreValidations[HEADING_LEVEL_MUST_NOT_SKIP]);
      const body = createSource('<h1>Titel</h1><h4>Kop</h4>');
      clippyDocument.register(body);
      await validationPass();
      const updates: (readonly DocumentViolation[])[] = [];
      clippyDocument.subscribe((violations) => updates.push(violations));

      body.fragment.querySelector('h1')!.outerHTML = '<h2>Titel</h2>';
      await validationPass();

      expect(updates).toHaveLength(1);
    });

    it('emits one update for a burst of editor mutations from one keystroke', async () => {
      const body = createSource('<p>Tekst</p><p>Meer</p>');
      clippyDocument.register(body);
      await validationPass();
      const updates: (readonly DocumentViolation[])[] = [];
      clippyDocument.subscribe((violations) => updates.push(violations));

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
      const { id } = clippyDocument.register({ anchor: host, fragment: shadowRoot, label: 'Component' });
      await validationPass();

      shadowRoot.querySelector('p')!.textContent = '';
      await validationPass();

      expect(clippyDocument.violations.map(({ rule, source }) => ({ rule, source }))).toEqual([
        { rule: PARAGRAPH_SHOULD_NOT_BE_EMPTY, source: id },
      ]);
    });
  });

  describe('source lifecycle', () => {
    it('revalidates the recomposed document when a source unregisters', async () => {
      clippyDocument.registerValidation(coreValidations[HEADING_LEVEL_MUST_NOT_SKIP]);
      clippyDocument.register(createSource('<h1>Titel</h1>'));
      const { unregister } = clippyDocument.register(createSource('<h2>Intro</h2>'));
      const { id } = clippyDocument.register(createSource('<h3>Kop</h3>'));
      await validationPass();

      unregister();
      await validationPass();

      expect(clippyDocument.violations.map(({ rule, source }) => ({ rule, source }))).toEqual([
        { rule: HEADING_LEVEL_MUST_NOT_SKIP, source: id },
      ]);
    });

    it('drops a source whose anchor is disconnected without unregistering', async () => {
      const removed = createSource('<p></p>');
      clippyDocument.register(removed);
      const body = createSource('<p>Tekst</p>');
      const { id } = clippyDocument.register(body);
      await validationPass();

      removed.anchor.remove();
      body.fragment.querySelector('p')!.textContent = '';
      await validationPass();

      expect(clippyDocument.violations.map(({ source }) => source)).toEqual([id]);
    });
  });

  describe('actions', () => {
    it('marks a violation correctable only when its validation offers a correction and its source handles one', async () => {
      clippyDocument.registerValidation(coreValidations[PARAGRAPH_SHOULD_NOT_BE_ENTIRELY_BOLD]);
      clippyDocument.register({ ...createSource(`${bold('Een')}<p></p>`), correct: () => undefined });
      clippyDocument.register(createSource(bold('Twee')));
      await validationPass();

      expect(clippyDocument.violations.map(({ correctable, rule }) => ({ correctable, rule }))).toEqual([
        { correctable: true, rule: PARAGRAPH_SHOULD_NOT_BE_ENTIRELY_BOLD },
        { correctable: false, rule: PARAGRAPH_SHOULD_NOT_BE_EMPTY },
        { correctable: false, rule: PARAGRAPH_SHOULD_NOT_BE_ENTIRELY_BOLD },
      ]);
    });

    it('marks a violation focusable only when its source handles focus', async () => {
      clippyDocument.register({ ...createSource('<p></p>'), focus: () => undefined });
      clippyDocument.register(createSource('<p></p>'));
      await validationPass();

      expect(clippyDocument.violations.map(({ focusable }) => focusable)).toEqual([true, false]);
    });
  });

  it('stops notifying a subscriber once it unsubscribes', async () => {
    const updates: unknown[] = [];
    const unsubscribe = clippyDocument.subscribe((violations) => updates.push(violations));

    unsubscribe();
    clippyDocument.register(createSource('<p></p>'));
    await validationPass();

    expect(updates).toEqual([]);
  });
});
