import { mount, unmountAll } from '@test/dom-fixtures';
import { afterEach, describe, expect, it } from 'vitest';
import { correctTableMissingHeadings, correctTableMissingRows } from './corrector';

afterEach(unmountAll);

describe('table correctors', () => {
  it('correctTableMissingHeadings converts the first row cells to headers', () => {
    const root = mount('<table><tbody><tr><td>a</td><td>b</td></tr><tr><td>c</td><td>d</td></tr></tbody></table>');
    correctTableMissingHeadings(root.querySelector('table')!)();
    const firstRow = root.querySelector('tr')!;
    expect(Array.from(firstRow.children).every((cell) => cell.tagName === 'TH')).toBe(true);
  });

  it('correctTableMissingRows appends a row with matching cell count', () => {
    const root = mount('<table><tbody><tr><th>a</th><th>b</th></tr></tbody></table>');
    correctTableMissingRows(root.querySelector('table')!)();
    const rows = root.querySelectorAll('tr');
    expect(rows).toHaveLength(2);
    expect(rows[1].children).toHaveLength(2);
  });
});
