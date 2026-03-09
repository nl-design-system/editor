import { GROUP, ITEM } from './constants.ts';

export type Item = (typeof ITEM)[keyof typeof ITEM];

export interface ToolbarGroupConfig {
  group: string;
  items: Item[];
}

export type ToolbarConfig = ToolbarGroupConfig[];

export const defaultToolbarConfig: ToolbarConfig = [
  {
    group: GROUP.SELECTS,
    items: [ITEM.FORMAT_SELECT, ITEM.LANGUAGE_SELECT],
  },
  {
    group: GROUP.TEXT_STYLING,
    items: [
      ITEM.BOLD,
      ITEM.ITALIC,
      ITEM.UNDERLINE,
      ITEM.STRIKE,
      ITEM.CODE,
      ITEM.HIGHLIGHT,
      ITEM.SUPERSCRIPT,
      ITEM.SUBSCRIPT,
    ],
  },
  {
    group: GROUP.HISTORY,
    items: [ITEM.UNDO, ITEM.REDO],
  },
  {
    group: GROUP.LISTS,
    items: [ITEM.ORDERED_LIST, ITEM.BULLET_LIST, ITEM.DEFINITION_LIST],
  },
  {
    group: GROUP.TABLE,
    items: [ITEM.INSERT_TABLE],
  },
  {
    group: GROUP.ALIGNMENT,
    items: [ITEM.TEXT_ALIGN],
  },
  {
    group: GROUP.INSERT,
    items: [ITEM.LINK, ITEM.IMAGE_UPLOAD, ITEM.HORIZONTAL_RULE],
  },
  {
    group: GROUP.TEXT_DIRECTION,
    items: [ITEM.TEXT_DIRECTION_LTR, ITEM.TEXT_DIRECTION_RTL],
  },
  {
    group: GROUP.TOOLS,
    items: [ITEM.KEYBOARD_SHORTCUTS, ITEM.ACCESSIBILITY_NOTIFICATIONS],
  },
];
