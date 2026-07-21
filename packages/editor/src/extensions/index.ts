import { msg } from '@lit/localize';
import { mergeAttributes } from '@tiptap/core';
import Blockquote from '@tiptap/extension-blockquote';
import Bold from '@tiptap/extension-bold';
import BubbleMenu from '@tiptap/extension-bubble-menu';
import Code from '@tiptap/extension-code';
import CodeBlock from '@tiptap/extension-code-block';
import Document from '@tiptap/extension-document';
import HardBreak from '@tiptap/extension-hard-break';
import Heading from '@tiptap/extension-heading';
import Highlight from '@tiptap/extension-highlight';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import Image from '@tiptap/extension-image';
import Italic from '@tiptap/extension-italic';
import Link from '@tiptap/extension-link';
import { BulletList, ListItem, OrderedList } from '@tiptap/extension-list';
import Paragraph from '@tiptap/extension-paragraph';
import Strike from '@tiptap/extension-strike';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import { TableKit } from '@tiptap/extension-table';
import Text from '@tiptap/extension-text';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { Dropcursor, UndoRedo, Placeholder } from '@tiptap/extensions';
import type { EditorSettings } from '@/types/settings';
import type { ValidationResult } from '@/types/validation';
import { contentClasses, headingClasses } from '@/constants';
import { CustomFileHandler } from '@/extensions/CustomFileHandler';
import { DefinitionList } from '@/extensions/DefinitionList';
import KeyboardShortcuts from '@/extensions/KeyboardShortcuts';
import { Table, TableBody, TableCaption, TableFoot, TableHead } from '@/extensions/Table';
import Validation from '@/extensions/Validation';

const globalAttributes = {
  dir: {},
  lang: {},
} as const;

export const editorExtensions = (
  settings: EditorSettings,
  callback: (resultMap: Map<Range, ValidationResult>) => void,
  identifier?: string,
) => [
  Document,
  Placeholder.configure({
    placeholder: msg('Start met typen...'),
  }),
  Paragraph.extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        ...globalAttributes,
      };
    },
  }).configure({
    HTMLAttributes: {
      class: contentClasses.paragraph,
    },
  }),
  Text,
  Heading.extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        ...globalAttributes,
      };
    },
    renderHTML({ HTMLAttributes, node }) {
      const hasLevel = this.options.levels.includes(node.attrs['level']);
      const level = hasLevel ? node.attrs['level'] : this.options.levels[0];
      return [
        `h${level}`,
        mergeAttributes({ class: headingClasses(level) }, this.options.HTMLAttributes, HTMLAttributes),
        0,
      ];
    },
  }),
  Bold,
  Code.configure({
    HTMLAttributes: {
      class: contentClasses.code,
    },
  }),
  CodeBlock.configure({
    HTMLAttributes: {
      class: contentClasses.codeBlock,
    },
  }),
  Italic,
  Underline,
  UndoRedo,
  HardBreak,
  BulletList.extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        ...globalAttributes,
      };
    },
  }).configure({
    HTMLAttributes: {
      class: contentClasses.bulletList,
    },
  }),
  OrderedList.extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        ...globalAttributes,
      };
    },
  }).configure({
    HTMLAttributes: {
      class: contentClasses.orderedList,
    },
  }),
  ListItem.extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        ...globalAttributes,
      };
    },
  }),
  DefinitionList,
  HorizontalRule.configure({
    HTMLAttributes: {
      class: contentClasses.horizontalRule,
    },
  }),
  Superscript.configure({
    HTMLAttributes: {
      class: contentClasses.superscript,
    },
  }),
  Strike,
  Subscript.configure({
    HTMLAttributes: {
      class: contentClasses.subscript,
    },
  }),
  Blockquote.configure({
    HTMLAttributes: {
      class: contentClasses.blockquote,
    },
  }).extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        ...globalAttributes,
      };
    },
  }),
  Link.extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        ...globalAttributes,
        rel: {
          default: null,
        },
        target: {
          default: null,
        },
        title: {
          default: null,
        },
      };
    },
  }).configure({
    defaultProtocol: 'https',
    HTMLAttributes: {
      class: contentClasses.link,
    },
    openOnClick: false,
  }),
  TextAlign.configure({
    types: ['heading', 'paragraph'],
  }),
  Image.configure({
    HTMLAttributes: {
      class: contentClasses.image,
    },
    resize: {
      alwaysPreserveAspectRatio: true,
      directions: ['top', 'bottom', 'left', 'right', 'top-right', 'top-left', 'bottom-right', 'bottom-left'],
      enabled: !settings.readonly,
      minHeight: 50,
      minWidth: 50,
    },
  }),
  Table.configure({
    HTMLAttributes: {
      class: contentClasses.table,
    },
  }),
  TableHead,
  TableFoot,
  TableCaption,
  TableBody,
  TableKit.configure({
    table: false,
  }),
  CustomFileHandler,
  Dropcursor.configure({
    class: 'dropcursor',
    width: 2,
  }),
  BubbleMenu.configure({
    element: document.getElementById('bubble-menu'),
    shouldShow: ({ editor, state }) => {
      const { selection } = state;
      const { $from } = selection;

      // Check if current node is an image
      if ($from.parent.type.name === 'image') return true;

      // Check if image is selected
      return editor.isActive('image');
    },
  }),
  KeyboardShortcuts,
  Validation.configure({
    identifier,
    settings,
    updateValidationsContext: callback,
  }),
  Highlight.configure({
    HTMLAttributes: {
      class: contentClasses.highlight,
    },
    multicolor: true,
  }),
];
