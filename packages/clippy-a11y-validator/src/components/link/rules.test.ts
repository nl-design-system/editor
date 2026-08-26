import { parseAndSelect } from '@test/dom-fixtures';
import { describe, expect, it } from 'vitest';
import { hasGenericLinkText } from './rules';

const link = (text: string): Element => parseAndSelect(`<a href="/x">${text}</a>`, 'a');

describe('hasGenericLinkText', () => {
  it.each(['Lees meer', 'lees meer', 'LEES MEER', 'Klik hier'])('flags "%s"', (text) => {
    expect(hasGenericLinkText(link(text))).toBe(true);
  });

  it('ignores surrounding whitespace', () => {
    expect(hasGenericLinkText(link('  lees meer  '))).toBe(true);
  });

  it('accepts link text naming its destination', () => {
    expect(hasGenericLinkText(link('Lees meer over toegankelijkheid'))).toBe(false);
  });

  it('ignores generic text outside a link', () => {
    expect(hasGenericLinkText(parseAndSelect('<p>lees meer</p>', 'p'))).toBe(false);
  });
});
