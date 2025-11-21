import Bold from '@tiptap/extension-bold';
import BubbleMenu from '@tiptap/extension-bubble-menu';
import Document from '@tiptap/extension-document';
import HardBreak from '@tiptap/extension-hard-break';
import Heading, { type Level } from '@tiptap/extension-heading';
import Image from '@tiptap/extension-image';
import Italic from '@tiptap/extension-italic';
import { BulletList, OrderedList } from '@tiptap/extension-list';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Underline from '@tiptap/extension-underline';
import { Dropcursor, UndoRedo, Placeholder } from '@tiptap/extensions';
import type { EditorSettings } from '@/types/settings.ts';
import type { ValidationResult } from '@/types/validation.ts';
import { CustomFileHandler } from '@/extensions/CustomFileHandler.ts';
import KeyboardShortcuts from '@/extensions/KeyboardShortcuts.ts';
import { CustomListItem } from '@/extensions/ListItem.ts';
import Validation from '@/extensions/Validation.ts';

const getHeadingLevels = (topHeadingLevel: number): Level[] =>
  Heading.options.levels.filter((level: Level) => {
    return level >= topHeadingLevel;
  });

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
  Heading.configure({
    levels: getHeadingLevels(settings.topHeadingLevel),
  }),
  Bold,
  Italic,
  Underline,
  UndoRedo,
  HardBreak,
  BulletList,
  OrderedList,
  CustomListItem,
  Image.configure({
    resize: {
      alwaysPreserveAspectRatio: true,
      directions: ['top', 'bottom', 'left', 'right', 'top-right', 'top-left', 'bottom-right', 'bottom-left'],
      enabled: true,
      minHeight: 50,
      minWidth: 50,
    },
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
