import { describe, expect, it } from 'vitest';
import { initializeRuleTest } from '../../../test-helpers/initialize-rule-test.ts';
import { paragraphShouldNotResembleList } from './index.ts';

const { fragment, validate, validator } = initializeRuleTest([paragraphShouldNotResembleList]);

describe('paragraphShouldNotResembleList', () => {
  it('flags a paragraph of line-broken bullets', () => {
    const [violation] = validate('<p>- een<br>- twee<br>- drie</p>');

    expect(violation?.rule).toBe('PARAGRAPH_SHOULD_NOT_RESEMBLE_LIST');
    expect(violation?.severity).toBe('info');
    expect(violation?.scope).toBe('document');
    expect(violation?.messages.title).toBe('Regels zien eruit als een lijst');
    expect(violation?.messages.explanation).toBe(
      '<p class="nl-paragraph">Deze regels beginnen met <strong>-</strong> en vormen een lijst die niet als lijst is opgemaakt.</p>',
    );
    expect(violation?.messages.solutions?.join('')).toContain('Verander de regels in een opsomming.');
  });

  it.each([
    ['a bulleted', '<p>- een<br>- twee</p>', 'Omzetten naar opsomming', 'e7347d49-e751-4f82-9105-0f8ef77e3bba'],
    [
      'a numbered',
      '<p>1. een<br>2. twee</p>',
      'Omzetten naar genummerde lijst',
      '77ec1d80-1931-40f3-bf4a-502cdffb98c6',
    ],
  ])('offers only the correction for %s list', (_, html, label, solutionId) => {
    const [violation] = validate(html);

    expect(violation?.corrections?.map((correction) => [correction.label, correction.solutionId])).toEqual([
      [label, solutionId],
    ]);
  });

  it('flags each bullet paragraph that is continued by the next one', () => {
    expect(validate('<p>- een</p><p>- twee</p><p>- drie</p>')).toHaveLength(2);
  });

  it('leaves the last paragraph of a run unflagged, as nothing continues it', () => {
    expect(validate('<p>- een</p><p>- twee</p>')[0]?.element.textContent).toBe('- een');
    expect(validate('<p>- een</p><p>- twee</p>')).toHaveLength(1);
  });

  it('reports the marker in the payload', () => {
    const cases: [string, string][] = [
      ['<p>- een<br>- twee</p>', '-'],
      ['<p>* een<br>* twee</p>', '*'],
      ['<p>• een<br>• twee</p>', '•'],
      ['<p>1. een<br>2. twee</p>', '1.'],
      ['<p>1 - een<br>2 - twee</p>', '1'],
      ['<p>1) een<br>2) twee</p>', '1)'],
    ];

    expect(cases.map(([html]) => validate(html)[0]?.payload)).toEqual(cases.map(([, prefix]) => ({ prefix })));
  });

  it('accepts a paragraph that only looks like a list on one line', () => {
    expect(validate('<p>- een enkele regel</p>')).toHaveLength(0);
  });

  it('accepts an ordered marker whose sequence does not continue', () => {
    expect(validate('<p>1. een<br>7. zeven</p>')).toHaveLength(0);
  });

  it('accepts ordinary prose', () => {
    expect(validate('<p>Neem een geldig identiteitsbewijs mee.</p>')).toHaveLength(0);
  });

  it('ignores a semantic list', () => {
    expect(validate('<ul><li>een</li><li>twee</li></ul><ol><li>een</li><li>twee</li></ol>')).toHaveLength(0);
  });

  /** name, paragraphs, expected list tag — the correction must always yield three items and no paragraphs. */
  const conversions: [string, string, string][] = [
    ['converts consecutive ordered paragraphs to an ol', '<p>1 - Test</p><p>2 - Test</p><p>3 - Test</p>', 'ol'],
    ['converts consecutive unordered paragraphs to a ul', '<p>- Test</p><p>- Test</p><p>- Test</p>', 'ul'],
    ['converts a line-broken ordered paragraph to an ol', '<p>1 - Test<br>2 - Test<br>3 - Test</p>', 'ol'],
    ['converts a line-broken unordered paragraph to a ul', '<p>- Test<br>- Test<br>- Test</p>', 'ul'],
  ];

  it.each(conversions)('%s', (_name, paragraphs, tag) => {
    const [violation] = validate(`<h1>Titel</h1>${paragraphs}`);
    violation?.corrections?.[0]?.execute();

    expect(fragment.querySelectorAll(`${tag} > li`)).toHaveLength(3);
    expect([...fragment.querySelectorAll(`${tag} > li`)].map((item) => item.textContent)).toEqual([
      'Test',
      'Test',
      'Test',
    ]);
    expect(fragment.querySelectorAll('p')).toHaveLength(0);
  });

  it('leaves the paragraph valid once corrected', () => {
    const [violation] = validate('<p>- een<br>- twee</p>');
    violation?.corrections?.[0]?.execute();

    expect(validator.validate([fragment])).toHaveLength(0);
  });

  it('keeps surrounding content intact when corrected', () => {
    const [violation] = validate('<h1>Titel</h1><p>- een<br>- twee</p><p>Slot.</p>');
    violation?.corrections?.[0]?.execute();

    expect(fragment.querySelector('h1')?.textContent).toBe('Titel');
    expect(fragment.querySelector('p')?.textContent).toBe('Slot.');
  });
});
