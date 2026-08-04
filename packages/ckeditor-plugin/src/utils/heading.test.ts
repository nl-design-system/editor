import type { Editor } from 'ckeditor5';
import { describe, expect, it } from 'vitest';
import { resolveTopHeadingLevel } from './heading.ts';

const editorWithHeadingOptions = (options: unknown): Editor =>
  ({
    config: { get: () => options },
  }) as unknown as Editor;

describe('resolveTopHeadingLevel', () => {
  it('returns 1 when the heading plugin is not configured', () => {
    expect(resolveTopHeadingLevel(editorWithHeadingOptions(undefined))).toBe(1);
  });

  it("returns CKEditor's default of 2, where heading1 renders as <h2>", () => {
    const editor = editorWithHeadingOptions([
      { class: 'ck-heading_paragraph', model: 'paragraph', title: 'Paragraph' },
      { class: 'ck-heading_heading1', model: 'heading1', title: 'Heading 1', view: 'h2' },
      { class: 'ck-heading_heading2', model: 'heading2', title: 'Heading 2', view: 'h3' },
      { class: 'ck-heading_heading3', model: 'heading3', title: 'Heading 3', view: 'h4' },
    ]);
    expect(resolveTopHeadingLevel(editor)).toBe(2);
  });

  it('returns 1 when the host has explicitly restored <h1>', () => {
    const editor = editorWithHeadingOptions([
      { class: 'ck-heading_paragraph', model: 'paragraph', title: 'Paragraph' },
      { class: 'ck-heading_heading1', model: 'heading1', title: 'Heading 1', view: 'h1' },
      { class: 'ck-heading_heading2', model: 'heading2', title: 'Heading 2', view: 'h2' },
    ]);
    expect(resolveTopHeadingLevel(editor)).toBe(1);
  });

  it('reads the view name off an object view definition', () => {
    const editor = editorWithHeadingOptions([
      { class: 'ck-heading_heading1', model: 'heading1', title: 'Heading 1', view: { name: 'h3', classes: 'title' } },
    ]);
    expect(resolveTopHeadingLevel(editor)).toBe(3);
  });

  it('ignores options without a resolvable view, such as paragraph', () => {
    const editor = editorWithHeadingOptions([
      { class: 'ck-heading_paragraph', model: 'paragraph', title: 'Paragraph' },
    ]);
    expect(resolveTopHeadingLevel(editor)).toBe(1);
  });
});
