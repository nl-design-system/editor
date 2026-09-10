import { describe, expect, it } from 'vitest';
import { initializeRuleTest } from '../../../test-helpers/initialize-rule-test.ts';
import { tableMustHaveHeadings } from './index.ts';

const { fragment, validate, validator } = initializeRuleTest([tableMustHaveHeadings]);

describe('tableMustHaveHeadings', () => {
  it('flags a table without header cells', () => {
    const [violation] = validate(
      '<table><tbody><tr><td>C1</td><td>C2</td></tr><tr><td>C3</td><td>C4</td></tr></tbody></table>',
    );

    expect(violation?.rule).toBe('TABLE_MUST_HAVE_HEADINGS');
    expect(violation?.severity).toBe('warning');
    expect(violation?.scope).toBe('element');
    expect(violation?.messages.error).toBe('Deze tabel heeft geen koprij en geen kopkolom.');
    expect(violation?.messages.solution).toContain('eerste rij of de eerste kolom');
  });

  it('accepts a table with a header row', () => {
    expect(
      validate(
        '<table><thead><tr><th>H1</th><th>H2</th></tr></thead><tbody><tr><td>C1</td><td>C2</td></tr></tbody></table>',
      ),
    ).toHaveLength(0);
  });

  it('accepts a table with a header column', () => {
    expect(
      validate('<table><tbody><tr><th>R1</th><td>C1</td></tr><tr><th>R2</th><td>C2</td></tr></tbody></table>'),
    ).toHaveLength(0);
  });

  it('flags a table whose first row mixes headers and cells', () => {
    expect(
      validate('<table><tbody><tr><th>H1</th><td>C1</td></tr><tr><td>C2</td><td>C3</td></tr></tbody></table>'),
    ).toHaveLength(1);
  });

  it('accepts a table without any rows', () => {
    expect(validate('<table></table>')).toHaveLength(0);
  });

  it('ignores elements that are not tables', () => {
    expect(validate('<div><tr><td>C1</td></tr></div>')).toHaveLength(0);
  });

  it('converts the first row to header cells when corrected', () => {
    const [violation] = validate(
      '<table><tbody><tr><td>C1</td><td>C2</td></tr><tr><td>C3</td><td>C4</td></tr></tbody></table>',
    );
    violation?.correct?.();

    expect([...fragment.querySelectorAll('tr:first-child > *')].map((cell) => cell.tagName)).toEqual(['TH', 'TH']);
    expect(validator.validate([fragment])).toHaveLength(0);
  });

  it('keeps the cell content and attributes when corrected', () => {
    const [violation] = validate('<table><tbody><tr><td colspan="2">C1</td></tr><tr><td>C2</td></tr></tbody></table>');
    violation?.correct?.();

    const header = fragment.querySelector('th');
    expect(header?.textContent).toBe('C1');
    expect(header?.getAttribute('colspan')).toBe('2');
  });
});
