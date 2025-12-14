import Bold from '@tiptap/extension-bold';
import BubbleMenu from '@tiptap/extension-bubble-menu';
import Code from '@tiptap/extension-code';
import Document from '@tiptap/extension-document';
import HardBreak from '@tiptap/extension-hard-break';
import Heading from '@tiptap/extension-heading';
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
  Paragraph,
  Text,
  Heading,
  Bold,
  Code.configure({
    HTMLAttributes: {
      class: 'nl-code',
    },
  }),
  Italic,
  Underline,
  UndoRedo,
  HardBreak,
  BulletList,
  OrderedList,
  CustomListItem,
  DefinitionList,
  Link.configure({
    defaultProtocol: 'https',
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
  Table,
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
];
