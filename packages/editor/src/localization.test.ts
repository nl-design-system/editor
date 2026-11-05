import { beforeEach, describe, expect, it } from 'vitest';
import { getDocumentLang } from './localization';

beforeEach(() => {
  document.documentElement.removeAttribute('lang');
});

describe('getDocumentLang', () => {
  it('falls back to Dutch when the document language has no Clippy copy', () => {
    document.documentElement.lang = 'en';

    expect(getDocumentLang()).toBe('nl');
  });

  it('matches a regional document language on its primary subtag', () => {
    document.documentElement.lang = 'nl-NL';

    expect(getDocumentLang()).toBe('nl');
  });

  it('falls back to Dutch when the document has no language', () => {
    expect(getDocumentLang()).toBe('nl');
  });
});
