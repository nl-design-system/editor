import { coreValidationRules, coreValidations } from '@nl-design-system-community/clippy-a11y-validator';
import { beforeEach, describe, expect, it } from 'vitest';
import type { RegistryViolation, SourceRegistration } from './types';
import { ClippyRegistry } from './index';

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
  return { anchor, contentRoot: anchor, label: 'Body' };
};

const validationPass = async () => {
  await Promise.resolve();
  await new Promise((resolve) => setTimeout(resolve));
};

let registry: ClippyRegistry;

beforeEach(() => {
  document.body.replaceChildren();
  registry = new ClippyRegistry();
  registry.registerValidation(coreValidations[PARAGRAPH_SHOULD_NOT_BE_EMPTY]);
});

describe('ClippyRegistry', () => {
  it('reports violations in a registered content root', async () => {
    const { id } = registry.register(createSource('<p></p>'));
    await validationPass();

    expect(registry.violations.map(({ rule, source }) => ({ rule, source }))).toEqual([
      { rule: PARAGRAPH_SHOULD_NOT_BE_EMPTY, source: id },
    ]);
  });

  it('revalidates a content root when elements in it change', async () => {
    const source = createSource('<p>Tekst</p>');
    registry.register(source);

    source.contentRoot.innerHTML = '<p></p>';
    await validationPass();

    expect(registry.violations.map(({ rule }) => rule)).toEqual([PARAGRAPH_SHOULD_NOT_BE_EMPTY]);
  });

  it('revalidates a content root when text in it changes', async () => {
    const source = createSource('<p>Tekst</p>');
    registry.register(source);

    (source.contentRoot.querySelector('p')!.firstChild as Text).data = '';
    await validationPass();

    expect(registry.violations.map(({ rule }) => rule)).toEqual([PARAGRAPH_SHOULD_NOT_BE_EMPTY]);
  });

  it('revalidates a content root when an attribute in it changes', async () => {
    registry.registerValidation(coreValidations[IMAGE_MUST_HAVE_ALT_TEXT]);
    const source = createSource('<img src="logo.png" alt="Logo">');
    registry.register(source);

    source.contentRoot.querySelector('img')!.removeAttribute('alt');
    await validationPass();

    expect(registry.violations.map(({ rule }) => rule)).toEqual([IMAGE_MUST_HAVE_ALT_TEXT]);
  });

  it('revalidates a detached content root when it changes', async () => {
    const contentRoot = document.createElement('div');
    contentRoot.innerHTML = '<p>Titel</p>';
    registry.register({ anchor: document.body, contentRoot, label: 'Title' });

    contentRoot.querySelector('p')!.textContent = '';
    await validationPass();

    expect(registry.violations.map(({ rule }) => rule)).toEqual([PARAGRAPH_SHOULD_NOT_BE_EMPTY]);
  });

  it('drops the violations of an unregistered source', async () => {
    const { id: kept } = registry.register(createSource('<p></p>'));
    const { unregister } = registry.register(createSource('<p></p>'));
    await validationPass();

    unregister();
    await validationPass();

    expect(registry.violations.map(({ source }) => source)).toEqual([kept]);
  });

  it('records which source every violation came from', async () => {
    const { id: title } = registry.register(createSource('<p></p>'));
    const { id: body } = registry.register(createSource('<p>Tekst</p><p></p><p></p>'));
    await validationPass();

    // 1 empty paragraph error on the title, 2 empty paragraphs on the body
    expect(registry.violations.map(({ source }) => source)).toEqual([title, body, body]);
  });

  it('stops observing a content root once the source unregisters', async () => {
    registry.register(createSource('<p>Tekst</p>'));
    const source = createSource('<p>Tekst</p>');
    const { unregister } = registry.register(source);
    unregister();
    await validationPass();
    const updates: unknown[] = [];
    registry.subscribe((violations) => updates.push(violations));

    source.contentRoot.innerHTML = '<p></p>';
    await validationPass();

    expect(updates).toEqual([]);
  });

  it('returns only an id and an unregister', () => {
    expect(Object.keys(registry.register(createSource('<p></p>'))).sort()).toEqual(['id', 'unregister']);
  });

  it('generates a distinct id for every source and ignores one supplied by the host', () => {
    const registration = { ...createSource('<p></p>'), id: 'body' } as SourceRegistration;

    const ids = [registry.register(registration).id, registry.register(registration).id];

    expect(new Set(ids).size).toBe(2);
    expect(ids).not.toContain('body');
  });

  it('validates registered sources against a validation registered afterwards', async () => {
    registry.register(createSource('<h1></h1>'));
    await validationPass();

    registry.registerValidation(coreValidations[HEADING_MUST_NOT_BE_EMPTY]);
    await validationPass();

    expect(registry.violations.map(({ rule }) => rule)).toEqual([HEADING_MUST_NOT_BE_EMPTY]);
  });

  it('drops the violations of an unregistered validation', async () => {
    const unregisterValidation = registry.registerValidation(coreValidations[HEADING_MUST_NOT_BE_EMPTY]);
    registry.register(createSource('<h1></h1><p></p>'));
    await validationPass();

    unregisterValidation();
    await validationPass();

    expect(registry.violations.map(({ rule }) => rule)).toEqual([PARAGRAPH_SHOULD_NOT_BE_EMPTY]);
  });

  it('notifies subscribers with the current violations when they change', async () => {
    const updates: string[][] = [];
    registry.subscribe((violations) => updates.push(violations.map(({ rule }) => rule)));

    registry.register(createSource('<p></p>'));
    await validationPass();

    expect(updates).toEqual([[PARAGRAPH_SHOULD_NOT_BE_EMPTY]]);
  });

  describe('composed view across sources', () => {
    const reportedViolations = () =>
      registry.violations.map(({ element, rule, source }) => ({ element, rule, source }));

    beforeEach(() => {
      registry.registerValidation(coreValidations[HEADING_LEVEL_MUST_NOT_SKIP]);
    });

    it('accepts a heading sequence that continues correctly from one source into the next', async () => {
      registry.register(createSource('<h1>Titel</h1>'));
      registry.register(createSource('<h2>Kop</h2><h3>Subkop</h3>'));
      await validationPass();

      expect(registry.violations).toEqual([]);
    });

    it('reads a detached proxy content root in the place of its anchor', async () => {
      const input = document.createElement('input');
      document.body.append(input);
      const body = createSource('<h3>Kop</h3>');
      const { id } = registry.register(body);
      const contentRoot = document.createElement('div');
      contentRoot.innerHTML = '<h1>Titel</h1>';

      registry.register({ anchor: input, contentRoot, label: 'Title' });
      await validationPass();

      expect(reportedViolations()).toEqual([
        { element: body.contentRoot.querySelector('h3'), rule: HEADING_LEVEL_MUST_NOT_SKIP, source: id },
      ]);
    });

    it('recomputes the order when a source registers between two others', async () => {
      registry.register(createSource('<h1>Titel</h1>'));
      const intro = createSource('<h2>Intro</h2>');
      registry.register(createSource('<h3>Kop</h3>'));

      registry.register(intro);
      await validationPass();

      expect(registry.violations).toEqual([]);
    });

    it('records the source that owns each element, in page order', async () => {
      const intro = createSource('<h1>Titel</h1><h3>Intro</h3>');
      const body = createSource('<h5>Kop</h5>');

      const { id: bodyId } = registry.register(body);
      const { id: introId } = registry.register(intro);
      await validationPass();

      expect(reportedViolations()).toEqual([
        { element: intro.contentRoot.querySelector('h3'), rule: HEADING_LEVEL_MUST_NOT_SKIP, source: introId },
        { element: body.contentRoot.querySelector('h5'), rule: HEADING_LEVEL_MUST_NOT_SKIP, source: bodyId },
      ]);
    });
  });

  describe('scheduling', () => {
    it('emits one update for several registrations arriving together', async () => {
      const updates: (readonly RegistryViolation[])[] = [];
      registry.subscribe((violations) => updates.push(violations));

      registry.register(createSource('<p></p>'));
      registry.register(createSource('<p></p>'));
      await validationPass();

      expect(updates.map((violations) => violations.length)).toEqual([2]);
    });

    it('emits one update for mutations in several sources arriving together', async () => {
      const title = createSource('<p>Titel</p>');
      const body = createSource('<p>Tekst</p>');
      registry.register(title);
      registry.register(body);
      await validationPass();
      const updates: (readonly RegistryViolation[])[] = [];
      registry.subscribe((violations) => updates.push(violations));

      title.contentRoot.innerHTML = '<p></p>';
      body.contentRoot.innerHTML = '<p></p>';
      await validationPass();

      expect(updates.map((violations) => violations.length)).toEqual([2]);
    });

    it('emits one update when a mutation and a registration arrive together', async () => {
      const body = createSource('<p>Tekst</p>');
      registry.register(body);
      await validationPass();
      const updates: (readonly RegistryViolation[])[] = [];
      registry.subscribe((violations) => updates.push(violations));

      body.contentRoot.innerHTML = '<p></p>';
      registry.register(createSource('<p></p>'));
      await validationPass();

      expect(updates.map((violations) => violations.length)).toEqual([2]);
    });
  });

  it('stops notifying a subscriber once it unsubscribes', async () => {
    const updates: unknown[] = [];
    const unsubscribe = registry.subscribe((violations) => updates.push(violations));

    unsubscribe();
    registry.register(createSource('<p></p>'));
    await validationPass();

    expect(updates).toEqual([]);
  });
});
