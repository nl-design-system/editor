import { mergeAttributes } from '@tiptap/core';
import Bold from '@tiptap/extension-bold';
import BubbleMenu from '@tiptap/extension-bubble-menu';
import Code from '@tiptap/extension-code';
import CodeBlock from '@tiptap/extension-code-block';
import Document from '@tiptap/extension-document';
import HardBreak from '@tiptap/extension-hard-break';
import Heading from '@tiptap/extension-heading';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import Italic from '@tiptap/extension-italic';
import Link from '@tiptap/extension-link';
import { BulletList, OrderedList } from '@tiptap/extension-list';
import Paragraph from '@tiptap/extension-paragraph';
import { TableKit } from '@tiptap/extension-table';
import Text from '@tiptap/extension-text';
import Underline from '@tiptap/extension-underline';
import { Dropcursor, UndoRedo, Placeholder } from '@tiptap/extensions';
import type { EditorSettings } from '@/types/settings.ts';
import type { ValidationResult } from '@/types/validation.ts';
import { CustomFileHandler } from '@/extensions/CustomFileHandler.ts';
import { DefinitionList } from '@/extensions/DefinitionList.ts';
import KeyboardShortcuts from '@/extensions/KeyboardShortcuts.ts';
import { CustomListItem } from '@/extensions/ListItem.ts';
import { Table, TableBody, TableCaption, TableFoot, TableHead } from '@/extensions/Table';
import Validation from '@/extensions/Validation.ts';

export const editorExtensions = (
  settings: EditorSettings,
  callback: (resultMap: Map<string, ValidationResult>) => void,
) => [
  Document,
  Placeholder.configure({
    placeholder: 'Start met typen...',
  }),
  Paragraph.extend({
    addAttributes() {
      return {
        dir: {},
        lang: {},
      };
    },
  }).configure({
    HTMLAttributes: {
      class: 'nl-paragraph',
    },
  }),
  Text,
  Heading.extend({
    addAttributes() {
      return {
        dir: {},
        lang: {},
        // `level` is copied from the original `Heading` implementation
        level: {
          default: 1,
          rendered: false,
        },
      };
    },
    renderHTML({ HTMLAttributes, node }) {
      const hasLevel = this.options.levels.includes(node.attrs['level']);
      const level = hasLevel ? node.attrs['level'] : this.options.levels[0];
      return [
        `h${level}`,
        mergeAttributes(
          { class: `nl-heading nl-heading--level-${level}` },
          this.options.HTMLAttributes,
          HTMLAttributes,
        ),
        0,
      ];
    },
  }),
  Bold,
  Code.configure({
    HTMLAttributes: {
      class: 'nl-code',
    },
  }),
  CodeBlock.configure({
    HTMLAttributes: {
      class: 'nl-code-block',
    },
  }),
  Italic,
  Underline,
  UndoRedo,
  HardBreak,
  BulletList.extend({
    addAttributes() {
      return {
        dir: {},
        lang: {},
      };
    },
  }).configure({
    HTMLAttributes: {
      class: 'utrecht-unordered-list utrecht-unordered-list--html-content',
    },
  }),
  OrderedList.extend({
    addAttributes() {
      return {
        dir: {},
        lang: {},
      };
    },
  }).configure({
    HTMLAttributes: {
      class: 'utrecht-ordered-list utrecht-ordered-list--html-content',
    },
  }),
  CustomListItem.extend({
    addAttributes() {
      return {
        dir: {},
        lang: {},
      };
    },
  }),
  DefinitionList,
  Link.configure({
    defaultProtocol: 'https',
    HTMLAttributes: {
      class: 'nl-link',
    },
    openOnClick: false,
  }),
  Image.configure({
    resize: {
      alwaysPreserveAspectRatio: true,
      directions: ['top', 'bottom', 'left', 'right', 'top-right', 'top-left', 'bottom-right', 'bottom-left'],
      enabled: true,
      minHeight: 50,
      minWidth: 50,
    },
  }),
  Table.configure({
    HTMLAttributes: {
      class: 'utrecht-table utrecht-table--html-table',
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
    settings,
    updateValidationsContext: callback,
  }),
  Highlight.configure({
    HTMLAttributes: {
      class: 'nl-mark',
    },
    multicolor: true,
  }),
];
