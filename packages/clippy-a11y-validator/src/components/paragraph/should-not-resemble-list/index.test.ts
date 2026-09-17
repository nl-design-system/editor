import { beforeEach, describe, expect, it } from 'vitest';
import { Validator } from '../../../validator.ts';
import { paragraphShouldNotResembleList } from './index.ts';

let root: HTMLElement;
const validator = new Validator({ validations: [paragraphShouldNotResembleList] });

const validate = (html: string) => {
  root.innerHTML = html;
  return validator.validate(root);
};

beforeEach(() => {
  root = document.createElement('div');
  document.body.replaceChildren(root);
});

describe('paragraphShouldNotResembleList', () => {
  it('flags a paragraph of line-broken bullets', () => {
    const [violation] = validate('<p>- een<br>- twee<br>- drie</p>');

    expect(violation?.rule).toBe('PARAGRAPH_SHOULD_NOT_RESEMBLE_LIST');
    expect(violation?.severity).toBe('info');
    expect(violation?.scope).toBe('block');
    expect(violation?.messages.error).toContain('"-"');
    expect(violation?.messages.solution).toBe('Gebruik een echte opsomming in plaats van regels die met "-" beginnen.');
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

  it('converts consecutive ordered paragraphs to an ol', () => {
    const [violation] = validate('<h1>Titel</h1><p>1 - Test</p><p>2 - Test</p><p>3 - Test</p>');
    violation?.correct?.();

    expect(root.querySelectorAll('ol > li')).toHaveLength(3);
    expect([...root.querySelectorAll('ol > li')].map((item) => item.textContent)).toEqual(['Test', 'Test', 'Test']);
    expect(root.querySelectorAll('p')).toHaveLength(0);
  });

  it('converts consecutive unordered paragraphs to a ul', () => {
    const [violation] = validate('<h1>Titel</h1><p>- Test</p><p>- Test</p><p>- Test</p>');
    violation?.correct?.();

    expect(root.querySelectorAll('ul > li')).toHaveLength(3);
    expect([...root.querySelectorAll('ul > li')].map((item) => item.textContent)).toEqual(['Test', 'Test', 'Test']);
    expect(root.querySelectorAll('p')).toHaveLength(0);
  });

  it('converts a line-broken ordered paragraph to an ol', () => {
    const [violation] = validate('<h1>Titel</h1><p>1 - Test<br>2 - Test<br>3 - Test</p>');
    violation?.correct?.();

    expect(root.querySelectorAll('ol > li')).toHaveLength(3);
    expect([...root.querySelectorAll('ol > li')].map((item) => item.textContent)).toEqual(['Test', 'Test', 'Test']);
    expect(root.querySelectorAll('p')).toHaveLength(0);
  });

  it('converts a line-broken unordered paragraph to a ul', () => {
    const [violation] = validate('<h1>Titel</h1><p>- Test<br>- Test<br>- Test</p>');
    violation?.correct?.();

    expect(root.querySelectorAll('ul > li')).toHaveLength(3);
    expect(root.querySelectorAll('p')).toHaveLength(0);
  });

  it('leaves the paragraph valid once corrected', () => {
    const [violation] = validate('<p>- een<br>- twee</p>');
    violation?.correct?.();

    expect(validator.validate(root)).toHaveLength(0);
  });

  it('keeps surrounding content intact when corrected', () => {
    const [violation] = validate('<h1>Titel</h1><p>- een<br>- twee</p><p>Slot.</p>');
    violation?.correct?.();

    expect(root.querySelector('h1')?.textContent).toBe('Titel');
    expect(root.querySelector('p')?.textContent).toBe('Slot.');
  });
});
