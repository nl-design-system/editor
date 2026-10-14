import { describe, expect, it } from 'vitest';
import type { ValidationMessagesByLocale } from './types/messages.ts';
import { coreValidations } from './components/index.ts';
import { resolveLocalised, resolveMessages } from './messages.ts';

const messages: ValidationMessagesByLocale = {
  en: { solution: '<p class="nl-paragraph">Fix the {nodeType}.</p>', title: 'The node is wrong.' },
  nl: { solution: '<p class="nl-paragraph">Herstel {nodeType}.</p>', title: 'De node is fout.' },
};

describe('resolveMessages', () => {
  it('returns the requested locale', () => {
    expect(resolveMessages(messages, 'en', 'nl').title).toBe('The node is wrong.');
  });

  it('falls back when the locale is missing', () => {
    expect(resolveMessages({ nl: messages.nl }, 'en', 'nl').title).toBe('De node is fout.');
  });

  it('interpolates payload values into the markup', () => {
    const resolved = resolveMessages(messages, 'en', 'nl', { nodeType: 'paragraph' });

    expect(resolved.solution).toBe('<p class="nl-paragraph">Fix the paragraph.</p>');
  });

  it('leaves unknown placeholders untouched', () => {
    expect(resolveMessages(messages, 'nl', 'nl', { other: 1 }).solution).toBe(
      '<p class="nl-paragraph">Herstel {nodeType}.</p>',
    );
  });

  /** Only the markup carries placeholders, so a title is whatever the validation wrote. */
  it('passes the title through untouched', () => {
    expect(resolveMessages(messages, 'en', 'nl', { nodeType: 'paragraph' }).title).toBe('The node is wrong.');
  });

  it('omits the solution when there is none', () => {
    expect(resolveMessages({ nl: { title: 'Fout.' } }, 'nl', 'nl').solution).toBeUndefined();
  });

  it('passes the documentation link through', () => {
    const withHref: ValidationMessagesByLocale = { nl: { href: 'https://nldesignsystem.nl/heading', title: 'Fout.' } };

    expect(resolveMessages(withHref, 'nl', 'nl').href).toBe('https://nldesignsystem.nl/heading');
  });

  it('takes the documentation link from the resolved locale', () => {
    const perLocale: ValidationMessagesByLocale = {
      en: { href: 'https://example.org/en', title: 'Wrong.' },
      nl: { href: 'https://example.org/nl', title: 'Fout.' },
    };

    expect(resolveMessages(perLocale, 'en', 'nl').href).toBe('https://example.org/en');
  });

  it('omits the documentation link when there is none', () => {
    expect(resolveMessages({ nl: { title: 'Fout.' } }, 'nl', 'nl')).not.toHaveProperty('href');
  });

  it('passes the markup a validation writes straight through', () => {
    const own: ValidationMessagesByLocale = {
      nl: { solution: '<p class="nl-paragraph">Herstel <strong>het</strong>.</p>' },
    };

    expect(resolveMessages(own, 'nl', 'nl').solution).toBe('<p class="nl-paragraph">Herstel <strong>het</strong>.</p>');
  });

  it('escapes what it reads off the document, which an author controls', () => {
    const own: ValidationMessagesByLocale = { nl: { solution: '<p class="nl-paragraph">Herstel {text}.</p>' } };

    expect(resolveMessages(own, 'nl', 'nl', { text: '<img src=x onerror=alert(1)>' }).solution).toBe(
      '<p class="nl-paragraph">Herstel &lt;img src=x onerror=alert(1)&gt;.</p>',
    );
  });

  it('escapes an ampersand in what it reads off the document', () => {
    const own: ValidationMessagesByLocale = { nl: { solution: '<p class="nl-paragraph">Herstel {text}.</p>' } };

    expect(resolveMessages(own, 'nl', 'nl', { text: 'Tom & Jerry' }).solution).toBe(
      '<p class="nl-paragraph">Herstel Tom &amp; Jerry.</p>',
    );
  });

  /** A placeholder sits in text content, where a quote is just a character, never in an attribute. */
  it('leaves quotes in what it reads off the document as they are', () => {
    const own: ValidationMessagesByLocale = { nl: { solution: '<p class="nl-paragraph">Herstel {text}.</p>' } };

    expect(resolveMessages(own, 'nl', 'nl', { text: '"lees meer"' }).solution).toBe(
      '<p class="nl-paragraph">Herstel "lees meer".</p>',
    );
  });

  it('leaves the title as plain text, markup and all', () => {
    const withTag: ValidationMessagesByLocale = { nl: { title: 'Het <em>-element is leeg.' } };

    expect(resolveMessages(withTag, 'nl', 'nl').title).toBe('Het <em>-element is leeg.');
  });

  it('interpolates the explanation a validation writes', () => {
    const own: ValidationMessagesByLocale = { nl: { explanation: '<p>Kopniveau <strong>{level}</strong>.</p>' } };

    expect(resolveMessages(own, 'nl', 'nl', { level: 3 }).explanation).toBe('<p>Kopniveau <strong>3</strong>.</p>');
  });

  it('does not interpolate the documentation link', () => {
    const withHref: ValidationMessagesByLocale = { nl: { href: 'https://example.org/{nodeType}', title: 'Fout.' } };

    expect(resolveMessages(withHref, 'nl', 'nl', { nodeType: 'alinea' }).href).toBe('https://example.org/{nodeType}');
  });
});

describe('resolveMessages with documentation', () => {
  /** "Hele alinea is dikgedrukt", whose explanation and solution the package ships as HTML. */
  const ENTIRELY_BOLD = 'd9c53eaf-16dd-42eb-bcc4-7d9f97283309';

  it('fills what the validation leaves out', () => {
    const resolved = resolveMessages({ nl: {} }, 'nl', 'nl', undefined, ENTIRELY_BOLD);

    expect(resolved.title).toBe('Hele alinea is dikgedrukt');
    expect(resolved.explanation).toContain('De hele alinea is dikgedrukt.');
    expect(resolved.solution).toContain('alleen voor de woorden of zinnen die extra aandacht nodig hebben');
  });

  it('lets the validation override the explanation and the solution', () => {
    const own: ValidationMessagesByLocale = {
      nl: {
        explanation: '<p class="nl-paragraph">Eigen uitleg.</p>',
        solution: '<p class="nl-paragraph">Eigen oplossing.</p>',
      },
    };
    const resolved = resolveMessages(own, 'nl', 'nl', undefined, ENTIRELY_BOLD);

    expect(resolved.explanation).toBe('<p class="nl-paragraph">Eigen uitleg.</p>');
    expect(resolved.solution).toBe('<p class="nl-paragraph">Eigen oplossing.</p>');
  });

  /** The title names the rule, not this violation, so the rule is the one that gets to name it. */
  it('keeps the title the rule gives it, whatever the validation writes', () => {
    const resolved = resolveMessages({ nl: { title: 'Eigen titel.' } }, 'nl', 'nl', undefined, ENTIRELY_BOLD);

    expect(resolved.title).toBe('Hele alinea is dikgedrukt');
  });

  it('has no explanation for a rule the documentation does not describe', () => {
    expect(resolveMessages({ nl: { title: 'Fout.' } }, 'nl', 'nl')).not.toHaveProperty('explanation');
  });
});

/**
 * A validation may leave its title to the documentation it names, but between the two something has
 * to name the issue — and no type can say "required unless `documentationId` is set".
 */
describe('every core validation resolves a title', () => {
  it.for(Object.values(coreValidations))('$rule', ({ documentationId, messages }) => {
    expect(resolveMessages(messages, 'nl', 'nl', undefined, documentationId).title).not.toBe('');
  });
});

describe('resolveLocalised', () => {
  it('returns the requested locale', () => {
    expect(resolveLocalised({ en: 'Edit', nl: 'Bewerken' }, 'en', 'nl')).toBe('Edit');
  });

  it('falls back to the fallback locale when the requested one is missing', () => {
    expect(resolveLocalised({ nl: 'Bewerken' }, 'en', 'nl')).toBe('Bewerken');
  });

  it('falls back to Dutch, the source language, when neither is present', () => {
    expect(resolveLocalised({ nl: 'Bewerken' }, 'en', 'en')).toBe('Bewerken');
  });
});
