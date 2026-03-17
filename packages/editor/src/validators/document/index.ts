import type { Editor } from '@tiptap/core';
import type { Level } from '@tiptap/extension-heading';
import type { Node, NodeType, Schema } from 'prosemirror-model';
import type { EditorSettings } from '@/types/settings.ts';
import type { DocumentValidator, ValidationResult } from '@/types/validation.ts';
import { documentValidations, validationSeverity } from '@/validators/constants.ts';
import { getNodeBoundingBox, isBold } from '@/validators/helpers.ts';

const documentValidators = new Map<string, DocumentValidator>();

export const documentMustHaveCorrectHeadingOrder = (editor: Editor, settings?: EditorSettings): ValidationResult[] => {
  const errors: ValidationResult[] = [];
  const { topHeadingLevel = 1 } = settings || {};
  let precedingHeadingLevel = topHeadingLevel;
  editor.$doc.node.descendants((node, pos) => {
    if (node.type.name === 'heading') {
      const headingLevel = node.attrs['level'];

      if (headingLevel < topHeadingLevel) {
        const correctLevel = topHeadingLevel;
        errors.push({
          apply: (editor: Editor) => {
            editor
              .chain()
              .focus()
              .setNodeSelection(pos)
              .toggleHeading({ level: correctLevel as Level })
              .run();
          },
          boundingBox: getNodeBoundingBox(editor, pos),
          pos,
          severity: validationSeverity.ERROR,
          tipPayload: {
            exceedsTopLevel: true,
            headingLevel: headingLevel,
            precedingHeadingLevel: precedingHeadingLevel,
          },
        });
      }

      if (headingLevel > precedingHeadingLevel + 1) {
        const correctLevel = precedingHeadingLevel + 1;
        errors.push({
          apply: (editor: Editor) => {
            editor
              .chain()
              .focus()
              .setNodeSelection(pos)
              .toggleHeading({ level: correctLevel as Level })
              .run();
          },
          boundingBox: getNodeBoundingBox(editor, pos),
          pos,
          severity: validationSeverity.WARNING,
          tipPayload: { headingLevel: headingLevel, precedingHeadingLevel: precedingHeadingLevel },
        });
      }
      precedingHeadingLevel = headingLevel;
    }
  });
  return errors;
};

const getParagraphLines = (node: Node): string[] => {
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

const orderedListIndicator = new RegExp(/^\d+[.)\]/ ]$/);
const unorderedListIndicator = new RegExp(/^\s*([•\-*+])\s+/);
const orderedPrefixPattern = /^\d+[.)\]/ ]\s*/;
const unorderedPrefixPattern = /^\s*[•\-*+]\s+/;

const getPrefixLength = (text: string, isOrdered: boolean): number => {
  const match = isOrdered ? orderedPrefixPattern.exec(text) : unorderedPrefixPattern.exec(text);
  return match ? match[0].length : 0;
};

/**
 * Find the absolute position of the first cell inside a table node.
 * Returns a position inside the cell's content (suitable for table commands).
 */
const findFirstCellPositionInTable = (editor: Editor, tablePos: number, tableNode: Node): number | null => {
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

/**
 * Converts a single paragraph node into one or more list item nodes.
 * Hard-break lines are split into individual items; inline marks are preserved
 * for single-paragraph items via `Fragment.cut`.
 */
const buildListItemsFromParagraph = (
  paragraphNode: Node,
  isOrdered: boolean,
  listItemType: NodeType,
  paragraphType: NodeType,
  schema: Schema,
): Node[] => {
  const lines = getParagraphLines(paragraphNode);

  if (lines.length > 1) {
    return lines.map((line) => {
      const prefixLen = getPrefixLength(line, isOrdered);
      const cleanedText = line.slice(prefixLen);
      const para = paragraphType.create(null, cleanedText.length > 0 ? [schema.text(cleanedText)] : []);
      return listItemType.create(null, [para]);
    });
  }

  const prefixLen = getPrefixLength(paragraphNode.textContent, isOrdered);
  const cleanedContent = paragraphNode.content.cut(prefixLen);
  const para = paragraphType.create(null, cleanedContent);
  return [listItemType.create(null, [para])];
};

export const documentMustHaveSemanticLists = (editor: Editor): ValidationResult[] => {
  const errors: ValidationResult[] = [];
  const $blocks: { node: Node; pos: number }[] = [];
  editor.$doc.node.descendants((node: Node, pos: number) => {
    if (node.type.isBlock) {
      $blocks.push({ node, pos });
    }
  });

  const decrement = (prefix: string): string => (prefix.startsWith('2') ? prefix.replace('2', '1') : prefix);

  for (const [index, { node, pos }] of $blocks.entries()) {
    if (node.type.name !== 'paragraph') {
      continue;
    }
    const firstPrefix = node.textContent.substring(0, 2);

    const isOrdered = orderedListIndicator.test(firstPrefix);
    const isUnordered = unorderedListIndicator.test(firstPrefix);

    if (!isOrdered && !isUnordered) {
      // Not a potential list
      continue;
    }

    const buildApply = (applyPos: number, applyIsOrdered: boolean) => (editor: Editor) => {
      const { doc, schema } = editor.state;

      const listType = applyIsOrdered ? schema.nodes['orderedList'] : schema.nodes['bulletList'];
      const listItemType = schema.nodes['listItem'];
      const paragraphType = schema.nodes['paragraph'];

      if (!listType || !listItemType || !paragraphType) return;

      const listItems: Node[] = [];
      let endPos = applyPos;
      let currentPos = applyPos;

      while (currentPos < doc.content.size) {
        const paragraphNode = doc.nodeAt(currentPos);
        if (paragraphNode?.type.name !== 'paragraph') break;

        const isListLike = applyIsOrdered
          ? orderedListIndicator.test(paragraphNode.textContent.substring(0, 2))
          : unorderedListIndicator.test(paragraphNode.textContent.substring(0, 2));

        if (!isListLike) break;

        endPos = currentPos + paragraphNode.nodeSize;
        listItems.push(
          ...buildListItemsFromParagraph(paragraphNode, applyIsOrdered, listItemType, paragraphType, schema),
        );
        currentPos = endPos;
      }

      if (listItems.length === 0) return;

      const { tr } = editor.state;
      tr.replaceWith(applyPos, endPos, listType.create(null, listItems));
      editor.view.dispatch(tr);
    };

    if ($blocks[index + 1]?.node.type.name === 'paragraph') {
      const secondPrefix = $blocks[index + 1].node.textContent.substring(0, 2);
      const decrementedSecondPrefix = decrement(secondPrefix);
      if (decrementedSecondPrefix === firstPrefix) {
        errors.push({
          apply: buildApply(pos, isOrdered),
          boundingBox: getNodeBoundingBox(editor, pos),
          pos,
          severity: validationSeverity.INFO,
          tipPayload: { prefix: firstPrefix.trim() },
        });
      }
    }

    const lines = getParagraphLines(node);
    if (lines.length > 1 && firstPrefix === decrement(lines[1].substring(0, 2))) {
      errors.push({
        apply: buildApply(pos, isOrdered),
        boundingBox: getNodeBoundingBox(editor, pos),
        pos,
        severity: validationSeverity.INFO,
        tipPayload: { prefix: firstPrefix.trim() },
      });
    }
  }
  return errors;
};

export const documentMustHaveSingleHeadingOne = (editor: Editor): ValidationResult[] => {
  const headingOneNodes: { pos: number; node: Node }[] = [];
  editor.$doc.node.descendants((node, pos) => {
    if (node.type.name === 'heading' && node.attrs['level'] === 1) {
      headingOneNodes.push({ node, pos });
    }
  });

  if (headingOneNodes.length > 1) {
    const incorrectHeadingOneNodes = [...headingOneNodes];
    incorrectHeadingOneNodes.shift();

    return incorrectHeadingOneNodes?.map(({ pos }) => ({
      apply: (editor: Editor) => {
        editor.chain().focus().setNodeSelection(pos).setHeading({ level: 2 }).run();
      },
      boundingBox: getNodeBoundingBox(editor, pos),
      pos,
      severity: validationSeverity.ERROR,
    }));
  }
  return [];
};

export const documentMustHaveTopLevelHeadingOne = (editor: Editor, settings?: EditorSettings): ValidationResult[] => {
  const { firstChild } = editor.$doc.node;
  const topHeadingLevel = settings?.topHeadingLevel ?? 1;
  if (topHeadingLevel === 1 && firstChild?.attrs['level'] !== topHeadingLevel) {
    return [
      {
        apply: (editor: Editor) => {
          editor.chain().focus().setNodeSelection(0).setHeading({ level: 1 }).run();
        },
        boundingBox: getNodeBoundingBox(editor, 1),
        pos: 1,
        severity: validationSeverity.INFO,
      },
    ];
  }
  return [];
};

const isDirectChildOfDoc = (editor: Editor, pos: number): boolean => {
  const $pos = editor.state.doc.resolve(pos);
  return $pos.parent.type.name === 'doc';
};

const documentShouldNotHaveHeadingResemblingParagraphs = (editor: Editor): ValidationResult[] => {
  const errors: ValidationResult[] = [];

  editor.$doc.node.descendants((node, pos) => {
    const { content, textContent, type } = node;
    if (
      type.name === 'paragraph' &&
      content.content.length === 1 &&
      isDirectChildOfDoc(editor, pos) &&
      content.content.every(({ marks }) => marks.length > 0 && marks.every(isBold)) &&
      textContent.trim().length <= 60
    ) {
      errors.push({
        apply: (editor: Editor) => {
          // Find the last heading before this paragraph to determine the correct level
          let precedingHeadingLevel = 1;
          editor.state.doc.nodesBetween(0, pos, (node) => {
            if (node.type.name === 'heading') {
              precedingHeadingLevel = node.attrs['level'] as number;
            }
            return true;
          });

          const targetLevel = Math.min(precedingHeadingLevel + 1, 6) as Level;

          editor
            .chain()
            .focus()
            .setNodeSelection(pos)
            .setHeading({ level: targetLevel })
            .setTextSelection({ from: pos + 1, to: pos + node.nodeSize - 1 })
            .unsetMark('bold')
            .unsetMark('italic')
            .run();
        },
        boundingBox: getNodeBoundingBox(editor, pos),
        pos,
        severity: validationSeverity.INFO,
      });
    }
  });

  return errors;
};

export const documentMustHaveTableWithHeadings = (editor: Editor): ValidationResult[] => {
  const errors: ValidationResult[] = [];

  editor.$doc.node.descendants((node: Node, pos: number) => {
    if (node.type.name !== 'table') {
      return false;
    }

    let hasHeaderRow = false;
    let hasHeaderColumn = false;

    // Find first row with explicit type
    let firstRow: Node | undefined;
    node.descendants((child: Node) => {
      if (!firstRow && child.type.name === 'tableRow') {
        firstRow = child;
        return false;
      }
      return true;
    });

    // Check if first row has header cells
    if (firstRow) {
      hasHeaderRow = firstRow.content.content.every((cell: Node) => cell.type.name === 'tableHeader');
    }

    // Check first cell of each row for header cells
    if (!hasHeaderRow) {
      const firstCells: Node[] = [];
      node.descendants((row: Node) => {
        if (row.type.name === 'tableRow' && row.firstChild) {
          firstCells.push(row.firstChild);
        }
      });

      hasHeaderColumn =
        firstCells.length > 0 &&
        firstCells.every((cell: Node) => {
          return cell.type.name === 'tableHeader';
        });
    }

    if (!hasHeaderRow && !hasHeaderColumn) {
      errors.push({
        apply: (editor: Editor) => {
          const tableNode = editor.state.doc.nodeAt(pos);
          if (!tableNode) return;
          const cellPos = findFirstCellPositionInTable(editor, pos, tableNode);
          if (cellPos === null) return;
          editor.chain().focus().setTextSelection(cellPos).toggleHeaderRow().run();
        },
        boundingBox: getNodeBoundingBox(editor, pos),
        pos,
        severity: validationSeverity.WARNING,
      });
    }
    return true;
  });

  return errors;
};

export const documentMustHaveTableWithMultipleRows = (editor: Editor): ValidationResult[] => {
  const errors: ValidationResult[] = [];

  editor.$doc.node.descendants((node: Node, pos: number) => {
    if (node.type.name !== 'table') {
      return false;
    }

    let rowCount = 0;
    node.descendants((child: Node) => {
      if (child.type.name === 'tableRow') {
        rowCount++;
      }
    });

    if (rowCount < 2) {
      errors.push({
        apply: (editor: Editor) => {
          const tableNode = editor.state.doc.nodeAt(pos);
          if (!tableNode) return;
          const cellPos = findFirstCellPositionInTable(editor, pos, tableNode);
          if (cellPos === null) return;
          editor.chain().focus().setTextSelection(cellPos).addRowAfter().run();
        },
        boundingBox: getNodeBoundingBox(editor, pos),
        pos,
        severity: validationSeverity.WARNING,
      });
    }

    return true;
  });

  return errors;
};

type DocumentValidationKey = (typeof documentValidations)[keyof typeof documentValidations];

export const documentValidatorObject: { [K in DocumentValidationKey]: DocumentValidator } = {
  [documentValidations.DOCUMENT_MUST_HAVE_CORRECT_HEADING_ORDER]: documentMustHaveCorrectHeadingOrder,
  [documentValidations.DOCUMENT_MUST_HAVE_SEMANTIC_LISTS]: documentMustHaveSemanticLists,
  [documentValidations.DOCUMENT_MUST_HAVE_SINGLE_HEADING_ONE]: documentMustHaveSingleHeadingOne,
  [documentValidations.DOCUMENT_MUST_HAVE_TABLE_WITH_HEADINGS]: documentMustHaveTableWithHeadings,
  [documentValidations.DOCUMENT_MUST_HAVE_TABLE_WITH_MULTIPLE_ROWS]: documentMustHaveTableWithMultipleRows,
  [documentValidations.DOCUMENT_MUST_HAVE_TOP_LEVEL_HEADING_ONE]: documentMustHaveTopLevelHeadingOne,
  [documentValidations.DOCUMENT_SHOULD_NOT_HAVE_HEADING_RESEMBLING_PARAGRAPHS]:
    documentShouldNotHaveHeadingResemblingParagraphs,
};

for (const [key, validator] of Object.entries(documentValidatorObject)) {
  documentValidators.set(key, validator);
}

export default documentValidators;
