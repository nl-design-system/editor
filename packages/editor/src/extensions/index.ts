import Bold from '@tiptap/extension-bold';
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
  Image,
  CustomFileHandler,
  Dropcursor.configure({
    class: 'dropcursor',
    width: 2,
  }),
  KeyboardShortcuts,
  Validation.configure({
    settings,
    updateValidationsContext: callback,
  }),
];
