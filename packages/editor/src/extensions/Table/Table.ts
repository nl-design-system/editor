import { mergeAttributes, Node } from '@tiptap/core';

export const Table = Node.create({
  name: 'table',
  addCommands() {
    return {
      insertTable:
        ({ cols = 3, rows = 3, withHeaderRow = true } = {}) =>
        ({ dispatch, editor, tr }) => {
          if (!dispatch) {
            return false;
          }

          const { schema } = editor;
          const { selection } = tr;
          const tableNode = schema.nodes['table'];
          const captionNode = schema.nodes['tableCaption'];
          const tableHeadNode = schema.nodes['tableHead'];
          const tableRowNode = schema.nodes['tableRow'];
          const tableCellNode = schema.nodes['tableCell'];
          const tableHeaderNode = schema.nodes['tableHeader'];

          if (!tableNode || !tableRowNode || !tableCellNode) {
            return false;
          }
          const tableCaption = captionNode?.create(null, schema.text('Tabelbijschrift'));

          const headerCells = Array.from({ length: cols }, () =>
            tableHeaderNode?.create(null, schema.text('Tabelkop-celinhoud')),
          );
          const bodyCells = Array.from({ length: cols }, () =>
            tableCellNode.create(null, schema.text('Tabellichaam-celinhoud')),
          );

          const headerRow =
            withHeaderRow && tableHeadNode
              ? tableHeadNode.create(null, [tableRowNode.create(null, headerCells)])
              : null;

          const bodyRows = Array.from({ length: withHeaderRow ? rows - 1 : rows }, () =>
            tableRowNode.create(null, bodyCells),
          );

          const tableBodyNode = schema.nodes['tableBody']?.create(null, bodyRows);

          const tableChildren = [
            ...(tableCaption ? [tableCaption] : []),
            ...(headerRow ? [headerRow] : []),
            ...(tableBodyNode ? [tableBodyNode] : []),
          ];

          const table = tableNode.create(null, tableChildren);

          const offset = selection.$from.end();
          tr.replaceRangeWith(offset, offset, table);

          dispatch(tr);
          return true;
        },
    };
  },
  addOptions() {
    return {
      HTMLAttributes: {
        class: 'utrecht-table',
      },
    };
  },
  content: 'tableCaption? tableHead? tableBody* tableFoot?',
  group: 'block',

  // isolating: true,

  parseHTML() {
    return [{ tag: 'table' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['table', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },

  tableRole: 'table',
});
