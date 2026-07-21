import {
  BlockQuote,
  ClassicEditor,
  CodeBlock,
  Essentials,
  Heading,
  List,
  Paragraph,
  type Editor,
  type EditorConfig,
  type PluginConstructor,
} from 'ckeditor5';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { NldsContentClasses } from './NldsContentClasses.ts';

// CKEditor's toolbar observes its own size; jsdom has no ResizeObserver.
beforeAll(() => {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

let editor: Editor | undefined;

afterEach(async () => {
  await editor?.destroy();
  editor = undefined;
});

const renderWith = async (html: string, plugins: PluginConstructor[], config: EditorConfig = {}): Promise<string> => {
  const element = document.createElement('div');
  document.body.append(element);

  editor = await ClassicEditor.create(element, {
    licenseKey: 'GPL',
    plugins: [Essentials, Paragraph, ...plugins, NldsContentClasses],
    ...config,
  });

  editor.setData(html);
  return editor.getData();
};

describe('NldsContentClasses', () => {
  it('adds the paragraph class', async () => {
    expect(await renderWith('<p>Hello</p>', [])).toContain('<p class="nl-paragraph">');
  });

  it('adds the block quote class', async () => {
    expect(await renderWith('<blockquote><p>Quote</p></blockquote>', [BlockQuote])).toContain(
      '<blockquote class="utrecht-blockquote utrecht-blockquote--html-blockquote">',
    );
  });

  it('adds the code block class', async () => {
    expect(await renderWith('<pre><code>const a = 1;</code></pre>', [CodeBlock])).toContain('nl-code-block');
  });

  it('adds the bulleted list class', async () => {
    expect(await renderWith('<ul><li>Item</li></ul>', [List])).toContain(
      '<ul class="utrecht-unordered-list utrecht-unordered-list--html-content">',
    );
  });

  it('adds the numbered list class', async () => {
    expect(await renderWith('<ol><li>Item</li></ol>', [List])).toContain(
      '<ol class="utrecht-ordered-list utrecht-ordered-list--html-content">',
    );
  });

  describe('headings', () => {
    // CKEditor's default config renders the `heading1` model as `<h2>`, so the class has to follow the
    // rendered tag rather than the model name.
    it('classes a heading by its rendered tag, not its model name', async () => {
      const html = await renderWith('<h2>Title</h2>', [Heading]);
      expect(html).toContain('<h2 class="nl-heading nl-heading--level-2">');
      expect(html).not.toContain('nl-heading--level-1');
    });

    it('follows a custom heading configuration', async () => {
      const html = await renderWith('<h1>Title</h1>', [Heading], {
        heading: {
          options: [
            { class: 'ck-heading_paragraph', model: 'paragraph', title: 'Paragraph' },
            { class: 'ck-heading_heading1', model: 'heading1', title: 'Heading 1', view: 'h1' },
          ],
        },
      });
      expect(html).toContain('<h1 class="nl-heading nl-heading--level-1">');
    });
  });
});
