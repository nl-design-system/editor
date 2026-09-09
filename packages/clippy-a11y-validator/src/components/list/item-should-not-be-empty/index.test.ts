import { beforeEach, describe, expect, it } from 'vitest';
import { Validator } from '../../../validator.ts';
import { listItemShouldNotBeEmpty } from './index.ts';

let root: HTMLElement;
const validator = new Validator({ validations: [listItemShouldNotBeEmpty] });

const validate = (html: string) => {
  root.innerHTML = html;
  return validator.validate(root);
};

beforeEach(() => {
  root = document.createElement('div');
  document.body.replaceChildren(root);
});

describe('listItemShouldNotBeEmpty', () => {
  it('flags an empty list item', () => {
    const [violation] = validate('<ul><li></li></ul>');

    expect(violation?.rule).toBe('LIST_ITEM_SHOULD_NOT_BE_EMPTY');
    expect(violation?.severity).toBe('info');
    expect(violation?.scope).toBe('block');
    expect(violation?.messages.error).toBe('Dit lijstitem is leeg.');
    expect(violation?.messages.solution).toBe('Verwijder het lege lijstitem of voeg tekst toe.');
  });

  it('flags empty items in an ordered list too', () => {
    expect(validate('<ol><li></li><li>twee</li></ol>')).toHaveLength(1);
  });

  it('flags an item holding only whitespace', () => {
    expect(validate('<ul><li> </li></ul>')).toHaveLength(1);
  });

  it('flags every empty item', () => {
    expect(validate('<ul><li></li><li>twee</li><li> </li></ul>')).toHaveLength(2);
  });

  it('accepts an item with text', () => {
    expect(validate('<ul><li>een</li></ul>')).toHaveLength(0);
  });

  it('accepts an item that only holds a nested list with content', () => {
    expect(validate('<ul><li><ul><li>genest</li></ul></li></ul>')).toHaveLength(0);
  });

  it('ignores elements that are not list items', () => {
    expect(validate('<ul></ul><p></p>')).toHaveLength(0);
  });

  it('removes the item when corrected', () => {
    const [violation] = validate('<ul><li></li><li>twee</li></ul>');
    violation?.correct?.();

    expect(root.querySelectorAll('li')).toHaveLength(1);
    expect(validator.validate(root)).toHaveLength(0);
  });
});
