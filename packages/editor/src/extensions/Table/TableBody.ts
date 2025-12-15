import { mergeAttributes, Node } from '@tiptap/core';

export const TableBody = Node.create({
  name: 'tableBody',

  addAttributes() {
    return {
      headRows: {
        default: 0,
      },
      rowHeadColumns: {
        default: 0,
        // parseHTML: (e) => 0,
        // renderHTML: (attrs) => {}
      },
    };
  },

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  content: 'tableRow+',

  parseHTML() {
    return [{ tag: 'tbody' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['tbody', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },

  tableRole: 'body',
});
