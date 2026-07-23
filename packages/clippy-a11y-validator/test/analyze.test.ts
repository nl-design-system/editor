import { describe, expect, it } from 'vitest';
import { ClippyValidations } from '@/analyze';
import { assertNoViolations, countBySeverity, formatViolations, hasSeverityAtLeast } from '@/reporter';

const analyze = (html: string) => new ClippyValidations().analyze(html);
const ids = (html: string): string[] => analyze(html).violations.map((v) => v.id);

describe('ClippyValidations.analyze', () => {
  it('reports an empty heading as an error', () => {
    const { violations } = analyze('<h1></h1>');
    const heading = violations.find((v) => v.id === 'heading-must-not-be-empty');
    expect(heading).toBeDefined();
    expect(heading!.severity).toBe('error');
    expect(heading!.nodes).toHaveLength(1);
  });

  it('reports a missing alt text as info with a node snippet', () => {
    const { violations } = analyze('<h1>Title</h1><p>Text</p><img src="cat.png">');
    const img = violations.find((v) => v.id === 'image-must-have-alt-text');
    expect(img).toBeDefined();
    expect(img!.severity).toBe('info');
    expect(img!.nodes[0].html).toContain('<img');
    expect(img!.nodes[0].target).toContain('img');
  });

  it('detects a generic link text', () => {
    expect(ids('<h1>Title</h1><p><a href="https://example.com">Lees meer</a></p>')).toContain(
      'link-should-not-be-too-generic',
    );
  });

  it('detects an underlined inline element', () => {
    expect(ids('<h1>Title</h1><p>text <u>underlined</u></p>')).toContain('inline-should-not-be-underlined');
  });

  it('detects a paragraph that resembles a list', () => {
    expect(ids('<h1>Title</h1><p>- one<br>- two<br>- three</p>')).toContain('paragraph-should-not-resemble-list');
  });

  it('detects skipped heading levels and reports the heading order rule', () => {
    expect(ids('<h1>Title</h1><h3>Skipped</h3>')).toContain('document-must-have-correct-heading-order');
  });

  it('reports a missing top-level heading as info', () => {
    const { violations } = analyze('<h2>Subtitle</h2><p>Text</p>');
    expect(violations.some((v) => v.id === 'document-must-have-top-level-heading-one' && v.severity === 'info')).toBe(
      true,
    );
  });

  it('flags every duplicate h1 as a node on one violation', () => {
    const { violations } = analyze('<h1>One</h1><p>x</p><h1>Two</h1><h1>Three</h1>');
    const dup = violations.find((v) => v.id === 'document-must-have-single-heading-one');
    expect(dup).toBeDefined();
    expect(dup!.nodes).toHaveLength(2);
  });

  it('returns no violations for accessible content', () => {
    const { violations } = analyze('<h1>Title</h1><p>A perfectly fine paragraph.</p>');
    expect(violations).toStrictEqual([]);
  });

  it('accepts a live element as input', () => {
    const el = document.createElement('div');
    el.innerHTML = '<h1></h1>';
    const { violations } = new ClippyValidations().analyze(el);
    expect(violations.map((v) => v.id)).toContain('heading-must-not-be-empty');
  });
});

describe('rule filtering', () => {
  it('withRules limits analysis to the given rules', () => {
    const html = '<h1></h1><img src="x.png">';
    const { violations } = new ClippyValidations().withRules(['image-must-have-alt-text']).analyze(html);
    expect(violations.map((v) => v.id)).toStrictEqual(['image-must-have-alt-text']);
  });

  it('withRules accepts SCREAMING_SNAKE_CASE keys', () => {
    const { violations } = new ClippyValidations().withRules(['HEADING_MUST_NOT_BE_EMPTY']).analyze('<h1></h1>');
    expect(violations.map((v) => v.id)).toStrictEqual(['heading-must-not-be-empty']);
  });

  it('withoutRules excludes the given rules', () => {
    const html = '<h1></h1><img src="x.png">';
    const { violations } = new ClippyValidations().withoutRules(['image-must-have-alt-text']).analyze(html);
    const reported = violations.map((v) => v.id);
    expect(reported).toContain('heading-must-not-be-empty');
    expect(reported).not.toContain('image-must-have-alt-text');
  });

  it('withTopHeadingLevel changes the expected starting level', () => {
    // Starting at h2 is fine when topHeadingLevel is 2
    const { violations } = new ClippyValidations().withTopHeadingLevel(2).analyze('<h2>Title</h2><p>Text</p>');
    expect(violations.some((v) => v.id === 'document-must-have-top-level-heading-one')).toBe(false);
  });
});

describe('reporter', () => {
  it('counts nodes by severity', () => {
    const result = analyze('<h1></h1><img src="x.png">');
    const counts = countBySeverity(result);
    expect(counts.error).toBeGreaterThanOrEqual(1);
    expect(counts.info).toBeGreaterThanOrEqual(1);
  });

  it('hasSeverityAtLeast detects errors', () => {
    expect(hasSeverityAtLeast(analyze('<h1></h1>'))).toBe(true);
    expect(hasSeverityAtLeast(analyze('<h1>Title</h1><p>ok</p>'))).toBe(false);
  });

  it('formatViolations renders a summary and an all-clear message', () => {
    expect(formatViolations(analyze('<h1>Title</h1><p>ok</p>'))).toContain('no issues found');
    const report = formatViolations(analyze('<h1></h1>'));
    expect(report).toContain('heading-must-not-be-empty');
    expect(report).toContain('error');
  });

  it('assertNoViolations throws on errors and passes on clean content', () => {
    expect(() => assertNoViolations(analyze('<h1></h1>'))).toThrow();
    expect(() => assertNoViolations(analyze('<h1>Title</h1><p>ok</p>'))).not.toThrow();
    // info-only content passes the default error gate
    expect(() => assertNoViolations(analyze('<h1>Title</h1><p>Text</p><img src="x.png">'))).not.toThrow();
  });
});
