import {
  BlockQuote,
  ClassicEditor,
  CodeBlock,
  Essentials,
  GeneralHtmlSupport,
  Heading,
  Image,
  ImageInline,
  List,
  Paragraph,
  Table,
  type Editor,
  type EditorConfig,
  type PluginConstructor,
} from 'ckeditor5';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { ContentClasses } from './ContentClasses.ts';

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
    plugins: [Essentials, Paragraph, ...plugins, ContentClasses],
    ...config,
  });

  editor.setData(html);
  return editor.getData();
};

describe('ContentClasses', () => {
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
  });

  // Pins which tag each class ends up on: hosts read `tags` from content-classes.json to keep the class
  // from being stripped by their server-side HTML filtering.
  describe('tags the classes land on', () => {
    it('classes the figure of a block image, not the img', async () => {
      const html = await renderWith('<figure class="image"><img src="a.png" alt="A"></figure>', [Image]);
      expect(html).toContain('<figure class="image utrecht-image">');
    });

    it('classes the img of an inline image', async () => {
      const html = await renderWith('<p><img src="a.png" alt="A"></p>', [ImageInline]);
      expect(html).toContain('<img class="utrecht-image"');
    });

    it('classes the figure of a table, not the table', async () => {
      const html = await renderWith('<table><tbody><tr><td>Cell</td></tr></tbody></table>', [Table]);
      expect(html).toContain('<figure class="table utrecht-table utrecht-table--html-table">');
    });
  });

  describe('configuration', () => {
    it('applies a configured class instead of the default', async () => {
      const html = await renderWith('<p>Hello</p>', [], { contentClasses: { paragraph: 'my-paragraph' } });
      expect(html).toContain('<p class="my-paragraph">');
    });

    it('renders the element without a class when configured empty', async () => {
      const html = await renderWith('<p>Hello</p>', [], { contentClasses: { paragraph: '' } });
      expect(html).toContain('<p>Hello</p>');
      expect(html).not.toContain('class');
    });

    it('overrides a list class', async () => {
      const html = await renderWith('<ul><li>Item</li></ul>', [List], {
        contentClasses: { bulletList: 'my-list' },
      });
      expect(html).toContain('<ul class="my-list">');
    });

    it('substitutes the level token per rendered heading', async () => {
      const html = await renderWith('<h2>A</h2><h3>B</h3>', [Heading], {
        contentClasses: { heading: 'my-heading my-heading--{level}' },
      });
      expect(html).toContain('<h2 class="my-heading my-heading--2">');
      expect(html).toContain('<h3 class="my-heading my-heading--3">');
    });
  });

  // General HTML Support keeps class attributes in the model (e.g. Drupal Full HTML mode).
  // Content saved with the previous class then arrives with that class already set.
  describe('content that already carries a class', () => {
    const withGhs = (contentClasses: EditorConfig['contentClasses']): EditorConfig => ({
      contentClasses,
      htmlSupport: { allow: [{ name: /.*/u, classes: true }] },
    });

    it('replaces the previous class instead of joining it', async () => {
      const html = await renderWith('<p class="nl-paragraph">Hello</p>', [GeneralHtmlSupport], {
        ...withGhs({ paragraph: 'my-paragraph' }),
      });
      expect(html).toContain('<p class="my-paragraph">');
      expect(html).not.toContain('nl-paragraph');
    });

    it('strips the class when the configuration is emptied', async () => {
      const html = await renderWith('<p class="nl-paragraph">Hello</p>', [GeneralHtmlSupport], {
        ...withGhs({ paragraph: '' }),
      });
      expect(html).toContain('<p>Hello</p>');
    });

    it('replaces a heading class per level', async () => {
      const html = await renderWith(
        '<h2 class="nl-heading nl-heading--level-2">A</h2>',
        [Heading, GeneralHtmlSupport],
        {
          ...withGhs({ heading: 'my-heading--{level}' }),
        },
      );
      expect(html).toContain('<h2 class="my-heading--2">');
      expect(html).not.toContain('nl-heading');
    });

    it('leaves classes it does not manage alone', async () => {
      const html = await renderWith('<p class="nl-paragraph editorial">Hello</p>', [GeneralHtmlSupport], {
        ...withGhs({ paragraph: 'my-paragraph' }),
      });
      expect(html).toContain('editorial');
      expect(html).not.toContain('nl-paragraph');
    });
  });
});
