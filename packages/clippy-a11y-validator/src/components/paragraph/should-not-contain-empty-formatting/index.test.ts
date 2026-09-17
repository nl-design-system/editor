import { beforeEach, describe, expect, it } from 'vitest';
import { Validator } from '../../../validator.ts';
import { paragraphShouldNotContainEmptyFormatting } from './index.ts';

let root: HTMLElement;
const validator = new Validator({ validations: [paragraphShouldNotContainEmptyFormatting] });

const validate = (html: string) => {
  root.innerHTML = html;
  return validator.validate(root);
};

beforeEach(() => {
  root = document.createElement('div');
  document.body.replaceChildren(root);
});

describe('paragraphShouldNotContainEmptyFormatting', () => {
  it('flags an empty bold element', () => {
    const [violation] = validate('<p><strong></strong></p>');

    expect(violation?.rule).toBe('PARAGRAPH_SHOULD_NOT_CONTAIN_EMPTY_FORMATTING');
    expect(violation?.severity).toBe('warning');
    expect(violation?.scope).toBe('inline');
    expect(violation?.messages.error).toBe('Het <strong>-element is leeg.');
  });

  it('names the offending tag in the solution', () => {
    const tags = ['strong', 'b', 'em', 'i', 'code', 'mark', 's', 'del', 'u'];

    expect(tags.map((tag) => validate(`<p><${tag}></${tag}></p>`)[0]?.messages.solution)).toEqual(
      tags.map((tag) => `Verwijder het lege <${tag}>-element of voeg tekst toe.`),
    );
  });

  it('reports the tag as the payload', () => {
    expect(validate('<p><mark></mark></p>')[0]?.payload).toEqual({ tag: 'mark' });
  });

  it('flags an element holding only whitespace', () => {
    expect(validate('<p><strong> </strong></p>')).toHaveLength(1);
  });

  it('accepts an element with text', () => {
    expect(validate('<p><strong>nadruk</strong></p>')).toHaveLength(0);
  });

  it('does not flag links, which have their own rule', () => {
    expect(validate('<p><a href="/a"></a></p>')).toHaveLength(0);
  });

  it('ignores elements that carry no formatting', () => {
    expect(validate('<p><span></span></p>')).toHaveLength(0);
  });

  it('only looks inside paragraphs', () => {
    expect(validate('<h2><strong></strong></h2><li><em></em></li><td><mark></mark></td>')).toHaveLength(0);
  });

  it('removes the element when corrected', () => {
    const [violation] = validate('<p>Zie <strong></strong>hier</p>');
    violation?.correct?.();

    expect(root.querySelector('p')?.innerHTML).toBe('Zie hier');
    expect(validator.validate(root)).toHaveLength(0);
  });
});
