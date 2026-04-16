import type { Editor } from '@tiptap/core';
import { describe, it, expect, afterEach } from 'vitest';
import { createTestEditor } from '../test/createTestEditor';

describe('Allowed HTML in Clippy Editor', () => {
  let editor: Editor;

  afterEach(() => {
    editor?.destroy();
  });

  describe('Paragraph (<p>)', () => {
    it('renders with the "nl-paragraph" class', async () => {
      editor = await createTestEditor('<p>Hello world</p>');
      expect(editor.getHTML()).toContain('<p class="nl-paragraph">Hello world</p>');
    });

    it('preserves the dir attribute', async () => {
      editor = await createTestEditor('<p dir="rtl">مرحبا</p>');
      expect(editor.getHTML()).toContain('dir="rtl"');
    });

    it('preserves the lang attribute', async () => {
      editor = await createTestEditor('<p lang="en">Hello</p>');
      expect(editor.getHTML()).toContain('lang="en"');
    });

    it('supports text-align via the TextAlign extension', async () => {
      editor = await createTestEditor('<p style="text-align: center">Centered</p>');
      const html = editor.getHTML();
      expect(html).toContain('text-align: center');
      expect(html).toContain('nl-paragraph');
    });
  });

  describe('Headings (<h1> – <h6>)', () => {
    const levels = [1, 2, 3, 4, 5, 6] as const;

    levels.forEach((level) => {
      it(`renders <h${level}> with classes "nl-heading nl-heading--level-${level}"`, async () => {
        const tempEditor = await createTestEditor(`<h${level}>Heading ${level}</h${level}>`);
        try {
          expect(tempEditor.getHTML()).toContain(`<h${level} class="nl-heading nl-heading--level-${level}">`);
        } finally {
          tempEditor.destroy();
        }
      });
    });

    it('preserves the dir attribute on a heading', async () => {
      editor = await createTestEditor('<h1 dir="rtl">Kop</h1>');
      expect(editor.getHTML()).toContain('dir="rtl"');
    });

    it('preserves the lang attribute on a heading', async () => {
      editor = await createTestEditor('<h1 lang="en">Heading</h1>');
      expect(editor.getHTML()).toContain('lang="en"');
    });

    it('supports text-align on headings via the TextAlign extension', async () => {
      editor = await createTestEditor('<h2 style="text-align: right">Right-aligned</h2>');
      expect(editor.getHTML()).toContain('text-align: right');
    });
  });

  describe('Blockquote (<blockquote>)', () => {
    it('renders with Utrecht Design System classes', async () => {
      editor = await createTestEditor('<blockquote><p>Quote text</p></blockquote>');
      expect(editor.getHTML()).toContain('<blockquote class="utrecht-blockquote utrecht-blockquote--html-blockquote">');
    });

    it('preserves paragraph content inside the blockquote', async () => {
      editor = await createTestEditor('<blockquote><p>Quote text</p></blockquote>');
      expect(editor.getHTML()).toContain('Quote text');
    });
  });

  describe('Code block (<pre><code>)', () => {
    it('renders <pre> with class "nl-code-block"', async () => {
      editor = await createTestEditor('<pre><code>const x = 1;</code></pre>');
      expect(editor.getHTML()).toContain('<pre class="nl-code-block">');
    });

    it('renders the inner <code> element', async () => {
      editor = await createTestEditor('<pre><code>const x = 1;</code></pre>');
      expect(editor.getHTML()).toContain('<code>');
    });

    it('preserves the code content', async () => {
      editor = await createTestEditor('<pre><code>const x = 1;</code></pre>');
      expect(editor.getHTML()).toContain('const x = 1;');
    });
  });

  describe('Horizontal rule (<hr>)', () => {
    it('renders with class "utrecht-separator"', async () => {
      editor = await createTestEditor('<p>Before</p><hr><p>After</p>');
      expect(editor.getHTML()).toContain('<hr class="utrecht-separator">');
    });
  });

  describe('Unordered list (<ul>)', () => {
    it('renders with Utrecht Design System classes', async () => {
      editor = await createTestEditor('<ul><li>Item 1</li><li>Item 2</li></ul>');
      expect(editor.getHTML()).toContain('<ul class="utrecht-unordered-list utrecht-unordered-list--html-content">');
    });

    it('renders <li> elements inside <ul>', async () => {
      editor = await createTestEditor('<ul><li>Item</li></ul>');
      expect(editor.getHTML()).toContain('<li>');
    });

    it('preserves the dir attribute on <ul>', async () => {
      editor = await createTestEditor('<ul dir="rtl"><li>Item</li></ul>');
      expect(editor.getHTML()).toContain('dir="rtl"');
    });

    it('preserves the lang attribute on <ul>', async () => {
      editor = await createTestEditor('<ul lang="en"><li>Item</li></ul>');
      expect(editor.getHTML()).toContain('lang="en"');
    });
  });

  describe('Ordered list (<ol>)', () => {
    it('renders with Utrecht Design System classes', async () => {
      editor = await createTestEditor('<ol><li>Item 1</li><li>Item 2</li></ol>');
      expect(editor.getHTML()).toContain('<ol class="utrecht-ordered-list utrecht-ordered-list--html-content">');
    });

    it('renders <li> elements inside <ol>', async () => {
      editor = await createTestEditor('<ol><li>Item</li></ol>');
      expect(editor.getHTML()).toContain('<li>');
    });

    it('preserves the dir attribute on <ol>', async () => {
      editor = await createTestEditor('<ol dir="rtl"><li>Item</li></ol>');
      expect(editor.getHTML()).toContain('dir="rtl"');
    });

    it('preserves the lang attribute on <ol>', async () => {
      editor = await createTestEditor('<ol lang="en"><li>Item</li></ol>');
      expect(editor.getHTML()).toContain('lang="en"');
    });
  });

  describe('List item (<li>)', () => {
    it('preserves the dir attribute', async () => {
      editor = await createTestEditor('<ul><li dir="rtl">Item</li></ul>');
      expect(editor.getHTML()).toContain('dir="rtl"');
    });

    it('preserves the lang attribute', async () => {
      editor = await createTestEditor('<ul><li lang="en">Item</li></ul>');
      expect(editor.getHTML()).toContain('lang="en"');
    });
  });

  describe('Definition list (<dl>, <dt>, <dd>)', () => {
    it('renders the <dl> element', async () => {
      editor = await createTestEditor('<dl><dt>Term</dt><dd>Description</dd></dl>');
      expect(editor.getHTML()).toContain('<dl>');
    });

    it('renders <dt> (definition term) elements', async () => {
      editor = await createTestEditor('<dl><dt>Term</dt><dd>Description</dd></dl>');
      expect(editor.getHTML()).toContain('<dt>');
    });

    it('renders <dd> (definition description) elements', async () => {
      editor = await createTestEditor('<dl><dt>Term</dt><dd>Description</dd></dl>');
      expect(editor.getHTML()).toContain('<dd>');
    });

    it('preserves the text content of <dt> and <dd>', async () => {
      editor = await createTestEditor('<dl><dt>My Term</dt><dd>My Definition</dd></dl>');
      const html = editor.getHTML();
      expect(html).toContain('My Term');
      expect(html).toContain('My Definition');
    });

    it('supports multiple term–description pairs', async () => {
      editor = await createTestEditor('<dl><dt>A</dt><dd>Alpha</dd><dt>B</dt><dd>Beta</dd></dl>');
      const html = editor.getHTML();
      expect(html).toContain('Alpha');
      expect(html).toContain('Beta');
    });
  });

  describe('Table (<table>)', () => {
    it('renders with Utrecht Design System classes', async () => {
      editor = await createTestEditor('<table><tbody><tr><td>Cell</td></tr></tbody></table>');
      expect(editor.getHTML()).toContain('<table class="utrecht-table utrecht-table--html-table">');
    });

    it('renders <caption> inside a table', async () => {
      editor = await createTestEditor(
        '<table><caption>Table caption</caption><tbody><tr><td>Cell</td></tr></tbody></table>',
      );
      expect(editor.getHTML()).toContain('<caption>Table caption</caption>');
    });

    it('renders <thead> inside a table', async () => {
      editor = await createTestEditor(
        '<table><thead><tr><th>Header</th></tr></thead><tbody><tr><td>Cell</td></tr></tbody></table>',
      );
      expect(editor.getHTML()).toContain('<thead>');
    });

    it('renders <tbody> with headrows and rowheadcolumns attributes', async () => {
      editor = await createTestEditor('<table><tbody><tr><td>Cell</td></tr></tbody></table>');
      const html = editor.getHTML();
      expect(html).toContain('<tbody');
      expect(html).toContain('headrows="0"');
      expect(html).toContain('rowheadcolumns="0"');
    });

    it('renders <tfoot> inside a table', async () => {
      editor = await createTestEditor(
        '<table><tbody><tr><td>Cell</td></tr></tbody><tfoot><tr><td>Footer</td></tr></tfoot></table>',
      );
      expect(editor.getHTML()).toContain('<tfoot>');
    });

    it('renders <tr> inside table sections', async () => {
      editor = await createTestEditor('<table><tbody><tr><td>Cell</td></tr></tbody></table>');
      expect(editor.getHTML()).toContain('<tr>');
    });

    it('renders <td> cells with colspan and rowspan attributes', async () => {
      editor = await createTestEditor('<table><tbody><tr><td>Cell</td></tr></tbody></table>');
      expect(editor.getHTML()).toContain('<td colspan="1" rowspan="1">');
    });

    it('renders <th> header cells with colspan and rowspan attributes', async () => {
      editor = await createTestEditor(
        '<table><thead><tr><th>Header</th></tr></thead><tbody><tr><td>Cell</td></tr></tbody></table>',
      );
      expect(editor.getHTML()).toContain('<th colspan="1" rowspan="1">');
    });

    it('wraps cell content in a paragraph', async () => {
      editor = await createTestEditor('<table><tbody><tr><td>Cell text</td></tr></tbody></table>');
      expect(editor.getHTML()).toContain('<p class="nl-paragraph">Cell text</p>');
    });

    it('produces correct full HTML for a table with caption, thead, and tbody', async () => {
      editor = await createTestEditor(`
        <h1>Title</h1>
        <table>
          <caption>caption</caption>
          <thead>
            <tr>
              <th>tablehead</th>
              <th>tablehead</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>table body cell</td>
              <td>table body cell</td>
            </tr>
          </tbody>
        </table>`);
      expect(editor.getHTML()).toEqual(
        `<h1 class="nl-heading nl-heading--level-1">Title</h1><table class="utrecht-table utrecht-table--html-table"><caption>caption</caption><thead><tr><th colspan="1" rowspan="1"><p class="nl-paragraph">tablehead</p></th><th colspan="1" rowspan="1"><p class="nl-paragraph">tablehead</p></th></tr></thead><tbody headrows="0" rowheadcolumns="0"><tr><td colspan="1" rowspan="1"><p class="nl-paragraph">table body cell</p></td><td colspan="1" rowspan="1"><p class="nl-paragraph">table body cell</p></td></tr></tbody></table>`,
      );
    });
  });

  describe('Image (<img>)', () => {
    it('renders with class "utrecht-image"', async () => {
      editor = await createTestEditor('<img src="https://example.com/img.png" alt="Example image">');
      const html = editor.getHTML();
      expect(html).toContain('<img');
      expect(html).toContain('class="utrecht-image"');
    });

    it('preserves the src attribute', async () => {
      editor = await createTestEditor('<img src="https://example.com/img.png" alt="Example">');
      expect(editor.getHTML()).toContain('src="https://example.com/img.png"');
    });

    it('preserves the alt attribute', async () => {
      editor = await createTestEditor('<img src="https://example.com/img.png" alt="Accessible description">');
      expect(editor.getHTML()).toContain('alt="Accessible description"');
    });

    it('preserves the width and height attribute', async () => {
      editor = await createTestEditor('<img src="https://example.com/img.png" width="100" height="100">');
      expect(editor.getHTML()).toContain('width="100" height="100"');
    });
  });

  describe('Hard break (<br>)', () => {
    it('renders <br> inside a paragraph', async () => {
      editor = await createTestEditor('<p>Line 1<br>Line 2</p>');
      expect(editor.getHTML()).toContain('<br>');
    });

    it('preserves text content on both sides of the break', async () => {
      editor = await createTestEditor('<p>First line<br>Second line</p>');
      const html = editor.getHTML();
      expect(html).toContain('First line');
      expect(html).toContain('Second line');
    });
  });

  describe('Bold (<strong>)', () => {
    it('renders the <strong> element', async () => {
      editor = await createTestEditor('<p><strong>Bold text</strong></p>');
      expect(editor.getHTML()).toContain('<strong>Bold text</strong>');
    });
  });

  describe('Italic (<em>)', () => {
    it('renders the <em> element', async () => {
      editor = await createTestEditor('<p><em>Italic text</em></p>');
      expect(editor.getHTML()).toContain('<em>Italic text</em>');
    });
  });

  describe('Underline (<u>)', () => {
    it('renders the <u> element', async () => {
      editor = await createTestEditor('<p><u>Underlined text</u></p>');
      expect(editor.getHTML()).toContain('<u>Underlined text</u>');
    });
  });

  describe('Strike (<s>)', () => {
    it('renders the <s> element', async () => {
      editor = await createTestEditor('<p><s>Strikethrough text</s></p>');
      expect(editor.getHTML()).toContain('<s>Strikethrough text</s>');
    });
  });

  describe('Inline code (<code>)', () => {
    it('renders <code> with class "nl-code"', async () => {
      editor = await createTestEditor('<p><code>inline code</code></p>');
      expect(editor.getHTML()).toContain('<code class="nl-code">inline code</code>');
    });
  });

  describe('Subscript (<sub>)', () => {
    it('renders <sub> with class "utrecht-subscript"', async () => {
      editor = await createTestEditor('<p>H<sub>2</sub>O</p>');
      expect(editor.getHTML()).toContain('<sub class="utrecht-subscript">2</sub>');
    });
  });

  describe('Superscript (<sup>)', () => {
    it('renders <sup> with class "utrecht-superscript"', async () => {
      editor = await createTestEditor('<p>E = mc<sup>2</sup></p>');
      expect(editor.getHTML()).toContain('<sup class="utrecht-superscript">2</sup>');
    });
  });

  describe('Link (<a>)', () => {
    it('renders with class "nl-link"', async () => {
      editor = await createTestEditor('<p><a href="https://example.com">Link</a></p>');
      const html = editor.getHTML();
      expect(html).toContain('<a');
      expect(html).toContain('class="nl-link"');
    });

    it('preserves the href attribute', async () => {
      editor = await createTestEditor('<p><a href="https://example.com">Link</a></p>');
      expect(editor.getHTML()).toContain('href="https://example.com"');
    });

    it('preserves the rel attribute', async () => {
      editor = await createTestEditor('<p><a href="https://example.com" rel="noopener noreferrer">Link</a></p>');
      expect(editor.getHTML()).toContain('rel="noopener noreferrer"');
    });

    it('preserves the target attribute', async () => {
      editor = await createTestEditor('<p><a href="https://example.com" target="_blank">Link</a></p>');
      expect(editor.getHTML()).toContain('target="_blank"');
    });

    it('preserves the title attribute', async () => {
      editor = await createTestEditor('<p><a href="https://example.com" title="Visit example">Link</a></p>');
      expect(editor.getHTML()).toContain('title="Visit example"');
    });

    it('preserves the link text', async () => {
      editor = await createTestEditor('<p><a href="https://example.com">Visit our website</a></p>');
      expect(editor.getHTML()).toContain('Visit our website');
    });

    it('preserves the lang attribute', async () => {
      editor = await createTestEditor('<p><a href="https://example.com" lang="nl">Visit our website</a></p>');
      expect(editor.getHTML()).toContain('lang="nl"');
    });
  });

  describe('Highlight (<mark>)', () => {
    it('renders <mark> with class "nl-mark"', async () => {
      editor = await createTestEditor('<p><mark>Highlighted text</mark></p>');
      expect(editor.getHTML()).toContain('<mark class="nl-mark">Highlighted text</mark>');
    });
  });

  describe('Inline marks inside block elements', () => {
    it('renders multiple inline marks inside a single paragraph', async () => {
      editor = await createTestEditor('<p><strong>Bold</strong>, <em>italic</em>, and <u>underline</u></p>');
      const html = editor.getHTML();
      expect(html).toContain('<strong>Bold</strong>');
      expect(html).toContain('<em>italic</em>');
      expect(html).toContain('<u>underline</u>');
    });

    it('renders inline marks inside list items', async () => {
      editor = await createTestEditor('<ul><li><strong>Bold item</strong></li></ul>');
      expect(editor.getHTML()).toContain('<strong>Bold item</strong>');
    });

    it('renders inline marks inside headings', async () => {
      editor = await createTestEditor('<h2><em>Italic heading</em></h2>');
      expect(editor.getHTML()).toContain('<em>Italic heading</em>');
    });

    it('renders a link inside a blockquote paragraph', async () => {
      editor = await createTestEditor('<blockquote><p><a href="https://example.com">Source</a></p></blockquote>');
      const html = editor.getHTML();
      expect(html).toContain('utrecht-blockquote');
      expect(html).toContain('href="https://example.com"');
    });

    it('renders code inside a paragraph alongside plain text', async () => {
      editor = await createTestEditor('<p>Run <code>npm install</code> first.</p>');
      const html = editor.getHTML();
      expect(html).toContain('<code class="nl-code">npm install</code>');
      expect(html).toContain('nl-paragraph');
    });

    it('renders a subscript and superscript together inside a paragraph', async () => {
      editor = await createTestEditor('<p>H<sub>2</sub>O and E=mc<sup>2</sup></p>');
      const html = editor.getHTML();
      expect(html).toContain('<sub class="utrecht-subscript">2</sub>');
      expect(html).toContain('<sup class="utrecht-superscript">2</sup>');
    });
  });

  describe('Nested lists', () => {
    it('renders a nested unordered list', async () => {
      editor = await createTestEditor('<ul><li>Parent<ul><li>Child</li></ul></li></ul>');
      const html = editor.getHTML();
      expect(html.split('<ul').length - 1).toBe(2);
      expect(html).toContain('Child');
    });

    it('renders a nested ordered list', async () => {
      editor = await createTestEditor('<ol><li>Parent<ol><li>Child</li></ol></li></ol>');
      const html = editor.getHTML();
      expect(html.split('<ol').length - 1).toBe(2);
      expect(html).toContain('Child');
    });
  });

  describe('Disallowed HTML is stripped', () => {
    it('strips <script> tags and their content', async () => {
      editor = await createTestEditor('<p>Safe text<script>alert("xss")</script></p>');
      expect(editor.getHTML()).not.toContain('<script>');
      expect(editor.getHTML()).not.toContain('alert(');
    });

    it('strips <style> tags and their content', async () => {
      editor = await createTestEditor('<p>Text<style>body { color: red }</style></p>');
      expect(editor.getHTML()).not.toContain('<style>');
    });

    it('strips <div> tags (content is wrapped in a paragraph instead)', async () => {
      editor = await createTestEditor('<div>Content inside div</div>');
      const html = editor.getHTML();
      expect(html).not.toContain('<div>');
      expect(html).toContain('Content inside div');
    });

    it('strips <span> tags (content is preserved as plain text)', async () => {
      editor = await createTestEditor('<p><span>Span content</span></p>');
      const html = editor.getHTML();
      expect(html).not.toContain('<span>');
      expect(html).toContain('Span content');
    });

    it('strips unknown/arbitrary HTML attributes', async () => {
      editor = await createTestEditor('<p data-custom="should-be-stripped">Text</p>');
      expect(editor.getHTML()).not.toContain('data-custom');
    });
  });
});
