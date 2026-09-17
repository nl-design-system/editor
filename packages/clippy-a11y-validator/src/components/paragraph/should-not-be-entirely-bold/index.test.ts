import { beforeEach, describe, expect, it } from 'vitest';
import { Validator } from '../../../validator.ts';
import { paragraphShouldNotResembleHeading } from '../should-not-resemble-heading/index.ts';
import { paragraphShouldNotBeEntirelyBold } from './index.ts';

const LONG = 'Deze alinea is volledig dikgedrukt en veel te lang om nog als een kop te kunnen doorgaan.';

let root: HTMLElement;
const validator = new Validator({ validations: [paragraphShouldNotBeEntirelyBold] });

const validate = (html: string) => {
  root.innerHTML = html;
  return validator.validate(root);
};

beforeEach(() => {
  root = document.createElement('div');
  document.body.replaceChildren(root);
});

describe('paragraphShouldNotBeEntirelyBold', () => {
  it('flags a long paragraph that is entirely bold', () => {
    const [violation] = validate(`<p><strong>${LONG}</strong></p>`);

    expect(violation?.rule).toBe('PARAGRAPH_SHOULD_NOT_BE_ENTIRELY_BOLD');
    expect(violation?.severity).toBe('warning');
    expect(violation?.scope).toBe('block');
    expect(violation?.messages.error).toBe('De hele alinea is dikgedrukt.');
    expect(violation?.messages.solution).toContain('alleen voor de woorden');
  });

  it('accepts a paragraph with bold and plain text', () => {
    expect(validate(`<p><strong>Dik</strong> en gewoon, ${LONG}</p>`)).toHaveLength(0);
  });

  it('accepts an empty paragraph', () => {
    expect(validate('<p> </p>')).toHaveLength(0);
  });

  it('flags a paragraph whose bold text is wrapped in another inline element', () => {
    expect(validate(`<p><em><strong>${LONG}</strong></em></p>`)).toHaveLength(1);
  });

  it('ignores elements that are not paragraphs', () => {
    expect(validate(`<div><strong>${LONG}</strong></div>`)).toHaveLength(0);
  });

  it('unwraps the bold children when corrected', () => {
    const [violation] = validate(`<p><strong>${LONG}</strong> <b>${LONG}</b></p>`);
    violation?.correct?.();

    expect(root.querySelector('p')?.innerHTML).toBe(`${LONG} ${LONG}`);
    expect(validator.validate(root)).toHaveLength(0);
  });

  describe('leaves the heading-like paragraphs to paragraphShouldNotResembleHeading', () => {
    it('accepts a short paragraph that is entirely bold', () => {
      expect(validate('<p><strong>Wat neemt u mee?</strong></p>')).toHaveLength(0);
    });

    it('accepts a paragraph of exactly 60 characters', () => {
      expect(validate(`<p><strong>${'a'.repeat(60)}</strong></p>`)).toHaveLength(0);
    });

    it('flags a paragraph of exactly 61 characters', () => {
      expect(validate(`<p><strong>${'a'.repeat(61)}</strong></p>`)).toHaveLength(1);
    });

    it('reports one rule per bold paragraph when both rules run', () => {
      const both = new Validator({
        validations: [paragraphShouldNotBeEntirelyBold, paragraphShouldNotResembleHeading],
      });
      root.innerHTML = `<p><strong>Wat neemt u mee?</strong></p><p><strong>${LONG}</strong></p>`;

      expect(both.validate(root).map((violation) => violation.rule)).toEqual([
        'PARAGRAPH_SHOULD_NOT_RESEMBLE_HEADING',
        'PARAGRAPH_SHOULD_NOT_BE_ENTIRELY_BOLD',
      ]);
    });
  });
});
