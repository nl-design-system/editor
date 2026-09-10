import { beforeEach, describe, expect, it } from 'vitest';
import { Validator } from '../../../validator.ts';
import { headingMustStartAtLevelOne } from './index.ts';

let root: HTMLElement;
const validator = new Validator({ validations: [headingMustStartAtLevelOne] });

const validate = (html: string) => {
  root.innerHTML = html;
  return validator.validate(root);
};

beforeEach(() => {
  root = document.createElement('div');
  document.body.replaceChildren(root);
});

describe('headingMustStartAtLevelOne', () => {
  it('flags a document whose first heading is not a level 1', () => {
    const [violation] = validate('<h2>Kop</h2><p>tekst</p>');

    expect(violation?.rule).toBe('HEADING_MUST_START_AT_LEVEL_ONE');
    expect(violation?.severity).toBe('info');
    expect(violation?.scope).toBe('block');
    expect(violation?.messages.error).toBe('Het document begint met kopniveau 2 in plaats van kopniveau 1.');
    expect(violation?.messages.solution).toBe('Maak van deze kop een kopniveau 1.');
  });

  it('reports the offending heading, not the first block', () => {
    const [violation] = validate('<p>inleiding</p><h3>Kop</h3>');

    expect(violation?.element.tagName).toBe('H3');
  });

  it('interpolates the level of the offending heading', () => {
    expect(validate('<h4>Kop</h4>')[0]?.messages.error).toContain('kopniveau 4');
  });

  it('accepts a document that starts with a level 1', () => {
    expect(validate('<h1>Titel</h1><h2>Kop</h2><p>tekst</p>')).toHaveLength(0);
  });

  it('accepts a level 1 that is preceded by other content', () => {
    expect(validate('<nav>menu</nav><p>inleiding</p><h1>Titel</h1>')).toHaveLength(0);
  });

  it('only reports the first heading', () => {
    expect(validate('<h2>Een</h2><h3>Twee</h3><h4>Drie</h4>')).toHaveLength(1);
  });

  it('looks through containers to find the first heading', () => {
    expect(validate('<section><h2>Kop</h2></section>')).toHaveLength(1);
  });

  it('does not report a document without any headings', () => {
    expect(validate('<p>alleen tekst</p><ul><li>item</li></ul>')).toHaveLength(0);
  });

  it('expects the document top heading level instead of a level 1 when the document is embedded', () => {
    root.innerHTML = '<h3>Kop</h3><p>tekst</p>';
    const [violation] = validator.validate(root, { topHeadingLevel: 2 });

    expect(violation?.messages.error).toBe('Het document begint met kopniveau 3 in plaats van kopniveau 2.');
    expect(violation?.messages.solution).toBe('Maak van deze kop een kopniveau 2.');

    violation?.correct?.();
    expect(root.innerHTML).toBe('<h2>Kop</h2><p>tekst</p>');
  });

  it('accepts a document that starts at the configured top heading level', () => {
    root.innerHTML = '<h2>Kop</h2><h3>Subkop</h3>';

    expect(validator.validate(root, { topHeadingLevel: 2 })).toHaveLength(0);
  });

  it('retags the heading to a level 1 when corrected', () => {
    const [violation] = validate('<h2 id="kop">Kop</h2><p>tekst</p>');
    violation?.correct?.();

    expect(root.innerHTML).toBe('<h1 id="kop">Kop</h1><p>tekst</p>');
    expect(validator.validate(root)).toHaveLength(0);
  });
});
