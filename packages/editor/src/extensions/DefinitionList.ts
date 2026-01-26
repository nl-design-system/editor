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
  content: 'definitionListItem+',
  group: 'block',
  parseHTML() {
    return [
      {
        getAttrs: (node) => {
          const element = node as HTMLElement;
          return element.classList.contains('utrecht-data-list') ? {} : false;
        },
        tag: 'dl',
      },
    ];
  },
  renderHTML() {
    return [
      'dl',
      {
        class: 'utrecht-data-list utrecht-data-list--html-dl utrecht-data-list--rows',
      },
      0,
    ];
  },
});

const DefinitionListItemNode = Node.create({
  name: 'definitionListItem',
  content: 'definitionTerm definitionDescription',
  parseHTML() {
    return [{ tag: 'div.utrecht-data-list__item' }];
  },
  renderHTML() {
    return ['div', { class: 'utrecht-data-list__item' }, 0];
  },
});

const DefinitionTermNode = Node.create({
  name: 'definitionTerm',
  content: 'inline*',
  parseHTML() {
    return [{ tag: 'dt' }];
  },
  renderHTML() {
    return ['dt', { class: 'utrecht-data-list__item-key' }, 0];
  },
});

const DefinitionDescriptionNode = Node.create({
  name: 'definitionDescription',
  content: 'inline*',
  parseHTML() {
    return [{ tag: 'dd' }];
  },
  renderHTML() {
    return [
      'dd',
      {
        class: 'utrecht-data-list__item-value utrecht-data-list__item-value--html-dd',
      },
      0,
    ];
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
                type: 'definitionListItem',
              },
            ],
            type: 'definitionList',
          });
        },
    };
  },

  addExtensions() {
    return [DefinitionListNode, DefinitionListItemNode, DefinitionTermNode, DefinitionDescriptionNode];
  },
});
