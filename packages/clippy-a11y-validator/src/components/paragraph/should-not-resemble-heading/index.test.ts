import { beforeEach, describe, expect, it } from 'vitest';
import { Validator } from '../../../validator.ts';
import { paragraphShouldNotResembleHeading } from './index.ts';

let root: HTMLElement;
const validator = new Validator({ validations: [paragraphShouldNotResembleHeading] });

const validate = (html: string) => {
  root.innerHTML = html;
  return validator.validate(root);
};

beforeEach(() => {
  root = document.createElement('div');
  document.body.replaceChildren(root);
});

describe('paragraphShouldNotResembleHeading', () => {
  it('flags a short, entirely bold paragraph', () => {
    const [violation] = validate('<p><strong>Wat neemt u mee?</strong></p>');

    expect(violation?.rule).toBe('PARAGRAPH_SHOULD_NOT_RESEMBLE_HEADING');
    expect(violation?.severity).toBe('info');
    expect(violation?.scope).toBe('block');
    expect(violation?.messages.error).toBe('Deze korte, volledig dikgedrukte alinea lijkt op een kop.');
    expect(violation?.messages.solution).toContain('Gebruik een echte kop');
  });

  it('treats b the same as strong', () => {
    expect(validate('<p><b>Wat neemt u mee?</b></p>')).toHaveLength(1);
  });

  it('flags bold text wrapped in another inline element', () => {
    expect(validate('<p><em><strong>Wat neemt u mee?</strong></em></p>')).toHaveLength(1);
  });

  it('flags a paragraph split across several bold elements', () => {
    expect(validate('<p><strong>Let op:</strong> <strong>neem uw paspoort mee.</strong></p>')).toHaveLength(1);
  });

  it('accepts a paragraph with mixed bold and plain text', () => {
    expect(validate('<p><strong>Dik</strong> en gewoon</p>')).toHaveLength(0);
  });

  it('accepts a long entirely bold paragraph', () => {
    const long = 'Dit is een lange alinea die volledig dikgedrukt is en daarom niet op een kop lijkt.';
    expect(long.length).toBeGreaterThan(60);
    expect(validate(`<p><strong>${long}</strong></p>`)).toHaveLength(0);
  });

  it('accepts a paragraph of exactly 61 characters', () => {
    expect(validate(`<p><strong>${'a'.repeat(61)}</strong></p>`)).toHaveLength(0);
  });

  it('flags a paragraph of exactly 60 characters', () => {
    expect(validate(`<p><strong>${'a'.repeat(60)}</strong></p>`)).toHaveLength(1);
  });

  it('accepts an empty paragraph', () => {
    expect(validate('<p> </p>')).toHaveLength(0);
  });

  it('ignores elements that are not paragraphs', () => {
    expect(validate('<div><strong>Wat neemt u mee?</strong></div>')).toHaveLength(0);
  });

  it('converts the paragraph to a heading one level below the preceding heading', () => {
    const [violation] = validate('<h2>Kosten</h2><p><strong>Wat neemt u mee?</strong></p>');
    violation?.correct?.();

    expect(root.innerHTML).toBe('<h2>Kosten</h2><h3>Wat neemt u mee?</h3>');
    expect(validator.validate(root)).toHaveLength(0);
  });

  it('converts to a level 1 when no heading precedes it', () => {
    const [violation] = validate('<p><strong>Paspoort aanvragen</strong></p>');
    violation?.correct?.();

    expect(root.innerHTML).toBe('<h1>Paspoort aanvragen</h1>');
  });

  it('does not propose a level beyond 6', () => {
    const [violation] = validate('<h6>Diep</h6><p><strong>Nog dieper</strong></p>');
    violation?.correct?.();

    expect(root.innerHTML).toBe('<h6>Diep</h6><h6>Nog dieper</h6>');
  });

  it('drops the bold formatting from the resulting heading', () => {
    const [violation] = validate('<p><strong>Wat neemt u mee?</strong></p>');
    violation?.correct?.();

    expect(root.querySelector('strong')).toBeNull();
  });
});
