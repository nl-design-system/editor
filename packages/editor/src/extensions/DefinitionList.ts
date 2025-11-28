import { Extension, type CommandProps, Node } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    definitionList: {
      insertDefinitionList: () => ReturnType;
    };
  }
}

const DefinitionListNode = Node.create({
  name: 'definitionList',
  content: '(definitionTerm definitionDescription)+',
  group: 'block',
  parseHTML() {
    return [{ tag: 'dl' }];
  },
  renderHTML() {
    return ['dl', 0];
  },
});

const DefinitionTermNode = Node.create({
  name: 'definitionTerm',
  content: 'inline*',
  group: 'definitionList',
  parseHTML() {
    return [{ tag: 'dt' }];
  },
  renderHTML() {
    return ['dt', 0];
  },
});

const DefinitionDescriptionNode = Node.create({
  name: 'definitionDescription',
  content: 'inline+',
  group: 'definitionList',
  parseHTML() {
    return [{ tag: 'dd' }];
  },
  renderHTML() {
    return ['dd', 0];
  },
});

export const DefinitionList = Extension.create({
  name: 'definitionListExtension',

  addCommands() {
    return {
      insertDefinitionList:
        () =>
        ({ commands }: CommandProps) => {
          return commands.insertContent({
            content: [
              {
                content: [{ text: 'Term', type: 'text' }],
                type: 'definitionTerm',
              },
              {
                content: [{ text: 'Detailbeschrijving', type: 'text' }],
                type: 'definitionDescription',
              },
            ],
            type: 'definitionList',
          });
        },
    };
  },

  addExtensions() {
    return [DefinitionListNode, DefinitionTermNode, DefinitionDescriptionNode];
  },
});
