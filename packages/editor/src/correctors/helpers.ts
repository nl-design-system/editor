import type { Editor } from '@tiptap/core';
import type { Node, NodeType, Schema } from 'prosemirror-model';

export const orderedListIndicator = /^\d+[.)\]/ ]$/;
export const unorderedListIndicator = /^\s*([•\-*+])\s+/;

const orderedPrefixPattern = /^\d+[.)\]/ ]\s*/;
const unorderedPrefixPattern = /^\s*[•\-*+]\s+/;

export const getParagraphLines = (node: Node): string[] => {
  const lines: string[] = [];
  let buffer = '';

  node.content.forEach((child) => {
    if (child.type.name === 'hardBreak') {
      if (buffer.trim().length) {
        lines.push(buffer);
      }
      buffer = '';
    } else {
      buffer += child.textContent;
    }
  });

  if (buffer.trim().length) {
    lines.push(buffer);
  }

  return lines;
};

export const getPrefixLength = (text: string, isOrdered: boolean): number => {
  const match = isOrdered ? orderedPrefixPattern.exec(text) : unorderedPrefixPattern.exec(text);
  return match ? match[0].length : 0;
};

export const isParagraphListLike = (paragraphNode: Node, isOrdered: boolean): boolean =>
  isOrdered
    ? orderedListIndicator.test(paragraphNode.textContent.substring(0, 2))
    : unorderedListIndicator.test(paragraphNode.textContent.substring(0, 2));

export const collectConsecutiveListParagraphs = (
  doc: Node,
  startPos: number,
  isOrdered: boolean,
): { endPos: number; paragraphs: Node[] } => {
  const paragraphs: Node[] = [];
  let currentPos = startPos;
  let endPos = startPos;

  while (currentPos < doc.content.size) {
    const node = doc.nodeAt(currentPos);
    if (node?.type.name !== 'paragraph' || !isParagraphListLike(node, isOrdered)) break;

    paragraphs.push(node);
    endPos = currentPos + node.nodeSize;
    currentPos = endPos;
  }

  return { endPos, paragraphs };
};

/**
 * Converts a single hard-break line of text into a list item node.
 * The list marker prefix is stripped; inline marks are lost because the line
 * has already been extracted as a plain string by `getParagraphLines`.
 */
export const createListItemFromLine = (
  line: string,
  isOrdered: boolean,
  listItemType: NodeType,
  paragraphType: NodeType,
  schema: Schema,
): Node => {
  const prefixLength = getPrefixLength(line, isOrdered);
  const textWithoutPrefix = line.slice(prefixLength);
  const paragraph = paragraphType.create(null, textWithoutPrefix.length > 0 ? [schema.text(textWithoutPrefix)] : []);
  return listItemType.create(null, [paragraph]);
};

/**
 * Converts a single-line paragraph node into a list item node.
 * Uses `Fragment.cut` to strip the list marker prefix while preserving
 * all inline marks (bold, italic, links, etc.) on the remaining content.
 */
export const createListItemFromParagraph = (
  paragraphNode: Node,
  isOrdered: boolean,
  listItemType: NodeType,
  paragraphType: NodeType,
): Node => {
  const prefixLength = getPrefixLength(paragraphNode.textContent, isOrdered);
  const contentWithoutPrefix = paragraphNode.content.cut(prefixLength);
  const paragraph = paragraphType.create(null, contentWithoutPrefix);
  return listItemType.create(null, [paragraph]);
};

/**
 * Converts a paragraph node into one or more list item nodes.
 *
 * - Multi-line paragraphs (separated by hard breaks) produce one list item per
 *   line via `createListItemFromLine`.
 * - Single-line paragraphs produce one list item with inline marks preserved
 *   via `createListItemFromParagraph`.
 */
export const buildListItemsFromParagraph = (
  paragraphNode: Node,
  isOrdered: boolean,
  listItemType: NodeType,
  paragraphType: NodeType,
  schema: Schema,
): Node[] => {
  const lines = getParagraphLines(paragraphNode);

  if (lines.length > 1) {
    return lines.map((line) => createListItemFromLine(line, isOrdered, listItemType, paragraphType, schema));
  }

  return [createListItemFromParagraph(paragraphNode, isOrdered, listItemType, paragraphType)];
};

/**
 * Finds the absolute position of the first cell inside a table node.
 * Returns a position inside the cell's content (suitable for table commands).
 */
export const findFirstCellPositionInTable = (editor: Editor, tablePos: number, tableNode: Node): number | null => {
  const { doc } = editor.state;
  let cellPos: number | null = null;

  doc.nodesBetween(tablePos + 1, tablePos + tableNode.nodeSize - 1, (node, nodePos) => {
    if (cellPos !== null) return false;
    if (node.type.name === 'tableCell' || node.type.name === 'tableHeader') {
      cellPos = nodePos + 1;
      return false;
    }
    return true;
  });

  return cellPos;
};
