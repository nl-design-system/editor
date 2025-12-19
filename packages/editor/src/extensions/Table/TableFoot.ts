import { mergeAttributes, Node } from '@tiptap/core';

export const TableFoot = Node.create({
  name: 'tableFoot',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  content: 'tableRow+',

  parseHTML() {
    return [{ tag: 'tfoot' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['tfoot', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },

  tableRole: 'foot',
});
