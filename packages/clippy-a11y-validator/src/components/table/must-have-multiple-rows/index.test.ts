import { beforeEach, describe, expect, it } from 'vitest';
import { Validator } from '../../../validator.ts';
import { tableMustHaveMultipleRows } from './index.ts';

let contentRoot: HTMLElement;
const validator = new Validator({ validations: [tableMustHaveMultipleRows] });

const validate = (html: string) => {
  contentRoot.innerHTML = html;
  return validator.validate([contentRoot]);
};

beforeEach(() => {
  contentRoot = document.createElement('div');
  document.body.replaceChildren(contentRoot);
});

describe('tableMustHaveMultipleRows', () => {
  it('flags a table with a single row', () => {
    const [violation] = validate('<table><tbody><tr><td>C1</td><td>C2</td></tr></tbody></table>');

    expect(violation?.rule).toBe('TABLE_MUST_HAVE_MULTIPLE_ROWS');
    expect(violation?.severity).toBe('warning');
    expect(violation?.scope).toBe('element');
    expect(violation?.messages.error).toBe('Deze tabel heeft minder dan twee rijen.');
  });

  it('flags a table without any rows', () => {
    expect(validate('<table></table>')).toHaveLength(1);
  });

  it('accepts a table with a header row and a body row', () => {
    expect(
      validate('<table><thead><tr><th>H1</th></tr></thead><tbody><tr><td>C1</td></tr></tbody></table>'),
    ).toHaveLength(0);
  });

  it('accepts a table with several body rows', () => {
    expect(validate('<table><tbody><tr><td>C1</td></tr><tr><td>C2</td></tr></tbody></table>')).toHaveLength(0);
  });

  it('ignores elements that are not tables', () => {
    expect(validate('<div>geen tabel</div>')).toHaveLength(0);
  });

  it('appends a row with matching cells when corrected', () => {
    const [violation] = validate('<table><tbody><tr><td>C1</td><td>C2</td></tr></tbody></table>');
    violation?.correct?.();

    expect(contentRoot.querySelectorAll('tr')).toHaveLength(2);
    expect(contentRoot.querySelectorAll('tr:last-child > td')).toHaveLength(2);
    expect(validator.validate([contentRoot])).toHaveLength(0);
  });

  it('offers no correction for a table without rows to copy', () => {
    const [violation] = validate('<table></table>');
    violation?.correct?.();

    expect(contentRoot.querySelectorAll('tr')).toHaveLength(0);
  });
});
