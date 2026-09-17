import { beforeEach, describe, expect, it } from 'vitest';
import { Validator } from '../../../validator.ts';
import { tableCellShouldNotBeEmpty } from './index.ts';

let root: HTMLElement;
const validator = new Validator({ validations: [tableCellShouldNotBeEmpty] });

const validate = (html: string) => {
  root.innerHTML = html;
  return validator.validate(root);
};

beforeEach(() => {
  root = document.createElement('div');
  document.body.replaceChildren(root);
});

describe('tableCellShouldNotBeEmpty', () => {
  it('flags an empty body cell', () => {
    const [violation] = validate('<table><tbody><tr><td></td></tr></tbody></table>');

    expect(violation?.rule).toBe('TABLE_CELL_SHOULD_NOT_BE_EMPTY');
    expect(violation?.severity).toBe('info');
    expect(violation?.scope).toBe('block');
    expect(violation?.messages.error).toBe('Deze tabelcel is leeg.');
  });

  it('flags an empty header cell', () => {
    expect(validate('<table><tbody><tr><th></th></tr></tbody></table>')).toHaveLength(1);
  });

  it('flags a cell holding only whitespace', () => {
    expect(validate('<table><tbody><tr><td> </td></tr></tbody></table>')).toHaveLength(1);
  });

  it('flags every empty cell in the table', () => {
    expect(
      validate('<table><tbody><tr><th>H1</th><th></th></tr><tr><td> </td><td>C2</td></tr></tbody></table>'),
    ).toHaveLength(2);
  });

  it('accepts a cell with content', () => {
    expect(validate('<table><tbody><tr><td>C1</td><th>H1</th></tr></tbody></table>')).toHaveLength(0);
  });

  it('ignores elements that are not cells', () => {
    expect(validate('<table><caption></caption><tbody><tr></tr></tbody></table>')).toHaveLength(0);
  });

  it('offers no correction, because removing a cell would break the row', () => {
    expect(validate('<table><tbody><tr><td></td></tr></tbody></table>')[0]?.correct).toBeUndefined();
  });
});
