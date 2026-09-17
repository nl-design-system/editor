import { beforeEach, describe, expect, it } from 'vitest';
import { Validator } from '../../../validator.ts';
import { unorderedListItemShouldNotBeEmpty } from './index.ts';

let root: HTMLElement;
const validator = new Validator({ validations: [unorderedListItemShouldNotBeEmpty] });

const validate = (html: string) => {
  root.innerHTML = html;
  return validator.validate(root);
};

beforeEach(() => {
  root = document.createElement('div');
  document.body.replaceChildren(root);
});

describe('unorderedListItemShouldNotBeEmpty', () => {
  it('flags an empty item', () => {
    const [violation] = validate('<ul><li>een</li><li></li></ul>');

    expect(violation?.rule).toBe('UNORDERED_LIST_ITEM_SHOULD_NOT_BE_EMPTY');
    expect(violation?.severity).toBe('info');
    expect(violation?.scope).toBe('block');
    expect(violation?.messages.error).toBe('Dit lijstitem is leeg.');
  });

  it('flags an item holding only whitespace', () => {
    expect(validate('<ul><li> </li></ul>')).toHaveLength(1);
  });

  it('accepts items with text', () => {
    expect(validate('<ul><li>een</li><li>twee</li></ul>')).toHaveLength(0);
  });

  it('leaves the other kind of list to its own rule', () => {
    expect(validate('<ol><li></li></ol>')).toHaveLength(0);
  });

  it('flags an empty item in a nested list of the same kind', () => {
    expect(validate('<ul><li>een<ul><li></li></ul></li></ul>')).toHaveLength(1);
  });

  it('removes the item when corrected', () => {
    const [violation] = validate('<ul><li>een</li><li></li></ul>');
    violation?.correct?.();

    expect(root.querySelectorAll('li')).toHaveLength(1);
    expect(validator.validate(root)).toHaveLength(0);
  });
});
