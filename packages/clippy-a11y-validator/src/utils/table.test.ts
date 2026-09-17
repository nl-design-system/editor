import { describe, expect, it } from 'vitest';
import { render } from '../test-helpers/render.ts';
import { hasHeaderColumn, hasHeaderRow, tableRows } from './table.ts';

const table = (html: string): HTMLTableElement => render(`<table>${html}</table>`) as HTMLTableElement;

describe('tableRows', () => {
  it('collects the rows of the table', () => {
    expect(tableRows(table('<tr><td>a</td></tr><tr><td>b</td></tr>'))).toHaveLength(2);
  });

  it('looks inside thead and tbody', () => {
    expect(tableRows(table('<thead><tr><th>a</th></tr></thead><tbody><tr><td>b</td></tr></tbody>'))).toHaveLength(2);
  });

  it('is empty for a table without rows', () => {
    expect(tableRows(table(''))).toEqual([]);
  });
});

describe('hasHeaderRow', () => {
  it('is true when the first row holds only header cells', () => {
    expect(hasHeaderRow(table('<tr><th>a</th><th>b</th></tr><tr><td>1</td><td>2</td></tr>'))).toBe(true);
  });

  it('is false when the first row mixes header and data cells', () => {
    expect(hasHeaderRow(table('<tr><th>a</th><td>b</td></tr>'))).toBe(false);
  });

  it('is false when only a later row holds header cells', () => {
    expect(hasHeaderRow(table('<tr><td>1</td></tr><tr><th>a</th></tr>'))).toBe(false);
  });

  it('is false for a table without rows', () => {
    expect(hasHeaderRow(table(''))).toBe(false);
  });
});

describe('hasHeaderColumn', () => {
  it('is true when every row opens with a header cell', () => {
    expect(hasHeaderColumn(table('<tr><th>a</th><td>1</td></tr><tr><th>b</th><td>2</td></tr>'))).toBe(true);
  });

  it('is false when a row opens with a data cell', () => {
    expect(hasHeaderColumn(table('<tr><th>a</th><td>1</td></tr><tr><td>b</td><td>2</td></tr>'))).toBe(false);
  });

  it('is false when a row has no cells at all', () => {
    expect(hasHeaderColumn(table('<tr><th>a</th></tr><tr></tr>'))).toBe(false);
  });
});
