import type { Editor } from '@tiptap/core';
import type { Mark } from 'prosemirror-model';

export const MIN_GUTTER_ITEM_HEIGHT = 8;

export const getNodeRange = (editor: Editor, pos: number): Range | null => {
  const domNode = editor.view.nodeDOM(pos);
  if (domNode instanceof HTMLElement) {
    const range = document.createRange();
    range.selectNode(domNode);
    return range;
  }
  if (domNode instanceof Text) {
    const range = document.createRange();
    range.selectNodeContents(domNode);
    return range;
  }
  return null;
};

export const isBold = (value: Mark): boolean => value.type.name === 'bold';
export const isItalic = (value: Mark): boolean => value.type.name === 'italic';

export const isKeyOf =
  <T, Keys extends PropertyKey>(obj: { [K in Keys]: T }) =>
  (arg: PropertyKey): arg is Keys =>
    Object.hasOwn(obj, arg);

/**
 * - include = ['*'] should include the whole map
 * - include = ['foo'] should only include foo
 * - exclude = ['foo'] includes everything except foo
 */
export const getEntries = <Keys extends string, Value>(
  input: { [K in Keys]: Value },
  include: (Keys | '*')[] = ['*'],
  exclude: (Keys | '*')[] = [],
): Partial<{ [K in Keys]: Value }> => {
  let map: Partial<{ [K in Keys]: Value }> = {};

  if (include.includes('*')) {
    map = { ...input };
  }

  include
    .filter((x): x is Keys => x !== '*')
    .forEach((key) => {
      if (Object.hasOwn(input, key)) {
        map[key] = input[key];
      }
    });

  exclude
    .filter((x): x is Keys => x !== '*')
    .forEach((key) => {
      if (Object.hasOwn(map, key)) {
        delete map[key];
      }
    });

  return map;
};
