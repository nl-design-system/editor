import { describe, expect, it } from 'vitest';
import { initializeRuleTest } from '../../../test-helpers/initialize-rule-test.ts';
import { linkShouldNotBeEmpty } from './index.ts';

const { fragment, validate, validator } = initializeRuleTest([linkShouldNotBeEmpty]);

describe('linkShouldNotBeEmpty', () => {
  it('flags a link without link text', () => {
    const [violation] = validate('<p><a href="/paspoort"></a></p>');

    expect(violation?.rule).toBe('LINK_SHOULD_NOT_BE_EMPTY');
    expect(violation?.severity).toBe('warning');
    expect(violation?.scope).toBe('element');
    expect(violation?.messages.error).toBe('Deze link heeft geen linktekst.');
    expect(violation?.messages.solution).toBe('Verwijder de lege link of voeg linktekst toe.');
  });

  it('flags a link holding only whitespace', () => {
    expect(validate('<p><a href="/paspoort"> </a></p>')).toHaveLength(1);
  });

  it('accepts a link with text', () => {
    expect(validate('<p><a href="/paspoort">Paspoort aanvragen</a></p>')).toHaveLength(0);
  });

  it('accepts a link whose text is nested in an inline element', () => {
    expect(validate('<p><a href="/paspoort"><strong>Paspoort aanvragen</strong></a></p>')).toHaveLength(0);
  });

  it('ignores elements that are not links', () => {
    expect(validate('<p><span></span></p>')).toHaveLength(0);
  });

  /** name, link content, expected violations — an image names its link through its alt text. */
  const images: [string, string, number][] = [
    [
      'accepts a link whose image alt text names the destination',
      '<img src="badge.png" alt="Paspoort aanvragen" />',
      0,
    ],
    ['accepts a link that pairs an image with text', '<img src="badge.png" alt="" />Paspoort aanvragen', 0],
    ['flags a link whose image has no alt attribute', '<img src="badge.png" />', 1],
    ['flags a link whose image has empty alt text', '<img src="badge.png" alt="" />', 1],
    ['flags a link whose image alt text is only whitespace', '<img src="badge.png" alt="   " />', 1],
  ];

  it.each(images)('%s', (_name, content, expected) => {
    expect(validate(`<p><a href="/paspoort">${content}</a></p>`)).toHaveLength(expected);
  });

  it('removes the link when corrected', () => {
    const [violation] = validate('<p>Zie <a href="/paspoort"></a>hier</p>');
    violation?.correct?.();

    expect(fragment.querySelector('p')?.innerHTML).toBe('Zie hier');
    expect(validator.validate([fragment])).toHaveLength(0);
  });
});
