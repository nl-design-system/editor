import { parseAndSelect } from '@test/dom-fixtures';
import { describe, expect, it } from 'vitest';
import { hasHeaderColumn, hasHeaderRow, hasSingleRow, isTable, lacksTableHeaders } from './rules';

const table = (html: string): Element => parseAndSelect(html, 'table');

const HEADER_ROW = '<table><tr><th>a</th><th>b</th></tr><tr><td>1</td><td>2</td></tr></table>';
const HEADER_COLUMN = '<table><tr><th>a</th><td>1</td></tr><tr><th>b</th><td>2</td></tr></table>';
const NO_HEADERS = '<table><tr><td>a</td><td>b</td></tr><tr><td>1</td><td>2</td></tr></table>';

describe('isTable', () => {
  it('recognises a table', () => {
    expect(isTable(table(HEADER_ROW))).toBe(true);
  });

  it('rejects anything else', () => {
    expect(isTable(parseAndSelect('<div></div>', 'div'))).toBe(false);
  });
});

describe('hasHeaderRow', () => {
  it('detects a first row of only header cells', () => {
    expect(hasHeaderRow(table(HEADER_ROW))).toBe(true);
  });

  it('rejects a first row mixing header and data cells', () => {
    expect(hasHeaderRow(table(HEADER_COLUMN))).toBe(false);
  });

  it('rejects a table without rows', () => {
    expect(hasHeaderRow(table('<table></table>'))).toBe(false);
  });
});

describe('hasHeaderColumn', () => {
  it('detects every row opening with a header cell', () => {
    expect(hasHeaderColumn(table(HEADER_COLUMN))).toBe(true);
  });

  it('rejects a table whose rows open with data cells', () => {
    expect(hasHeaderColumn(table(NO_HEADERS))).toBe(false);
  });
});

describe('lacksTableHeaders', () => {
  it('flags a populated table with no headers at all', () => {
    expect(lacksTableHeaders(table(NO_HEADERS))).toBe(true);
  });

  it('accepts a table with a header row', () => {
    expect(lacksTableHeaders(table(HEADER_ROW))).toBe(false);
  });

  it('accepts a table with a header column', () => {
    expect(lacksTableHeaders(table(HEADER_COLUMN))).toBe(false);
  });

  it('exempts an empty table', () => {
    expect(lacksTableHeaders(table('<table></table>'))).toBe(false);
  });

  it('ignores a non-table', () => {
    expect(lacksTableHeaders(parseAndSelect('<div></div>', 'div'))).toBe(false);
  });
});

describe('hasSingleRow', () => {
  it('flags a table of one row', () => {
    expect(hasSingleRow(table('<table><tr><th>a</th></tr></table>'))).toBe(true);
  });

  it('accepts a table of two rows', () => {
    expect(hasSingleRow(table(HEADER_ROW))).toBe(false);
  });

  it('flags a table with no rows', () => {
    expect(hasSingleRow(table('<table></table>'))).toBe(true);
  });

  it('ignores a non-table', () => {
    expect(hasSingleRow(parseAndSelect('<div></div>', 'div'))).toBe(false);
  });
});
