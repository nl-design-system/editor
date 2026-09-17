import { beforeEach, describe, expect, it } from 'vitest';
import { Validator } from '../../../validator.ts';
import { headingLevelOneMustBeUnique } from './index.ts';

let root: HTMLElement;
const validator = new Validator({ validations: [headingLevelOneMustBeUnique] });

const validate = (html: string) => {
  root.innerHTML = html;
  return validator.validate(root);
};

beforeEach(() => {
  root = document.createElement('div');
  document.body.replaceChildren(root);
});

describe('headingLevelOneMustBeUnique', () => {
  it('flags a second level 1 heading', () => {
    const [violation] = validate('<h1>Eerste</h1><h1>Tweede</h1>');

    expect(violation?.rule).toBe('HEADING_LEVEL_ONE_MUST_BE_UNIQUE');
    expect(violation?.severity).toBe('error');
    expect(violation?.scope).toBe('block');
    expect(violation?.messages.error).toBe('Dit document heeft meer dan één kopniveau 1.');
    expect(violation?.messages.solution).toContain('kopniveau 2');
  });

  it('reports the duplicate, not the first heading', () => {
    expect(validate('<h1>Eerste</h1><h1>Tweede</h1>')[0]?.element.textContent).toBe('Tweede');
  });

  it('flags every duplicate beyond the first', () => {
    expect(validate('<h1>Een</h1><p>tekst</p><h1>Twee</h1><h1>Drie</h1>')).toHaveLength(2);
  });

  it('accepts a document with exactly one level 1', () => {
    expect(validate('<h1>Titel</h1><h2>Kop</h2><p>tekst</p>')).toHaveLength(0);
  });

  it('accepts a document without any level 1', () => {
    expect(validate('<h2>Kop</h2><h3>Subkop</h3>')).toHaveLength(0);
  });

  it('ignores headings at other levels', () => {
    expect(validate('<h2>Een</h2><h2>Twee</h2>')).toHaveLength(0);
  });

  it('counts a level 1 nested in a container', () => {
    expect(validate('<h1>Titel</h1><section><h1>Nog een titel</h1></section>')).toHaveLength(1);
  });

  it('ignores a level 1 outside the validated root', () => {
    const outside = document.createElement('h1');
    outside.textContent = 'Paginatitel';
    document.body.replaceChildren(outside, root);
    root.innerHTML = '<h1>Titel</h1>';

    expect(validator.validate(root)).toHaveLength(0);
  });

  it('retags the duplicate to a level 2 when corrected', () => {
    const [violation] = validate('<h1>Eerste</h1><h1 id="tweede">Tweede</h1>');
    violation?.correct?.();

    expect(root.innerHTML).toBe('<h1>Eerste</h1><h2 id="tweede">Tweede</h2>');
    expect(validator.validate(root)).toHaveLength(0);
  });
});
