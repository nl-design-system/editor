import { beforeEach, describe, expect, it } from 'vitest';
import { Validator } from '../../../validator.ts';
import { headingLevelMustNotSkip } from './index.ts';

let contentRoot: HTMLElement;
const validator = new Validator({ validations: [headingLevelMustNotSkip] });

const validate = (html: string) => {
  contentRoot.innerHTML = html;
  return validator.validate([contentRoot]);
};

beforeEach(() => {
  contentRoot = document.createElement('div');
  document.body.replaceChildren(contentRoot);
});

describe('headingLevelMustNotSkip', () => {
  it('flags a heading that skips a level', () => {
    const [violation] = validate('<h1>Titel</h1><h3>Kop</h3>');

    expect(violation?.rule).toBe('HEADING_LEVEL_MUST_NOT_SKIP');
    expect(violation?.severity).toBe('warning');
    expect(violation?.scope).toBe('page');
    expect(violation?.messages.error).toBe('Kopniveau 3 volgt direct op kopniveau 1.');
    expect(violation?.messages.solution).toBe('Gebruik kopniveau 2, zodat er geen kopniveau wordt overgeslagen.');
  });

  it('reports the levels involved in the payload', () => {
    expect(validate('<h2>Kop</h2><h5>Diep</h5>')[0]?.payload).toEqual({
      expectedHeadingLevel: 3,
      headingLevel: 5,
      precedingHeadingLevel: 2,
    });
  });

  it('accepts a heading order that descends one level at a time', () => {
    expect(validate('<h1>Een</h1><h2>Twee</h2><h3>Drie</h3>')).toHaveLength(0);
  });

  it('accepts a heading that returns to a higher level', () => {
    expect(validate('<h1>Een</h1><h2>Twee</h2><h3>Drie</h3><h2>Vier</h2>')).toHaveLength(0);
  });

  it('accepts repeated headings at the same level', () => {
    expect(validate('<h2>Een</h2><h2>Twee</h2>')).toHaveLength(0);
  });

  it('never flags the first heading, whatever its level', () => {
    expect(validate('<h4>Kop</h4>')).toHaveLength(0);
  });

  it('compares against the nearest preceding heading, across containers', () => {
    expect(validate('<section><h2>Kosten</h2></section><h4>Kop</h4>')).toHaveLength(1);
  });

  it('flags a level skipped between two content roots', () => {
    const title = document.createElement('div');
    title.innerHTML = '<h1>Titel</h1>';
    contentRoot.innerHTML = '<h3>Kop</h3>';

    expect(validator.validate([title, contentRoot])).toHaveLength(1);
  });

  it('flags each skip separately', () => {
    expect(validate('<h1>Een</h1><h3>Twee</h3><h5>Drie</h5>')).toHaveLength(2);
  });

  it('ignores headings outside the validated content root', () => {
    const outside = document.createElement('h1');
    outside.textContent = 'Paginatitel';
    document.body.replaceChildren(outside, contentRoot);
    contentRoot.innerHTML = '<h4>Kop</h4>';

    expect(validator.validate([contentRoot])).toHaveLength(0);
  });

  it('retags the heading to the expected level when corrected', () => {
    const [violation] = validate('<h1>Titel</h1><h4 id="kop">Kop</h4>');
    violation?.correct?.();

    expect(contentRoot.innerHTML).toBe('<h1>Titel</h1><h2 id="kop">Kop</h2>');
    expect(validator.validate([contentRoot])).toHaveLength(0);
  });

  it('does not propose a level beyond 6', () => {
    expect(validate('<h6>Diep</h6><h6>Nog dieper</h6>')).toHaveLength(0);
  });

  it('settles a run of skips in a single pass of corrections', () => {
    validate('<h1>Een</h1><h3>Twee</h3><h5>Drie</h5>').forEach(({ correct }) => correct?.());

    expect([...contentRoot.querySelectorAll('h1, h2, h3')].map(({ tagName }) => tagName)).toEqual(['H1', 'H2', 'H3']);
    expect(validator.validate([contentRoot])).toHaveLength(0);
  });
});
