import { ListItem } from '@tiptap/extension-list';

export const CustomListItem = ListItem.extend({
  name: 'listItem',
  // TODO: bummer, content does not allow mix of inline and block, so can't allow both text and nested lists
  // Documentation: https://tiptap.dev/docs/editor/core-concepts/schema#nodes-and-marks
  content: 'inline*',
});
