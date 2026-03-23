import type { Editor } from '@tiptap/core';
import type { Level } from '@tiptap/extension-heading';
import type { Node } from 'prosemirror-model';
import type { EditorSettings } from '@/types/settings.ts';
import type { DocumentValidator, ValidationResult } from '@/types/validation.ts';
import { documentValidations, validationSeverity } from '@/constants';
import { documentCorrectorMap } from '@/correctors';
import { getParagraphLines, orderedListIndicator, unorderedListIndicator } from '@/correctors/helpers.ts';
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
        errors.push({
          boundingBox: getNodeBoundingBox(editor, pos),
          correct: documentCorrectorMap[documentValidations.DOCUMENT_MUST_HAVE_CORRECT_HEADING_ORDER](
            pos,
            topHeadingLevel as Level,
          ),
          pos,
          severity: validationSeverity.ERROR,
          tipPayload: {
            headingLevel: headingLevel,
            precedingHeadingLevel: precedingHeadingLevel,
            topHeadingLevel: topHeadingLevel,
          },
        });
      }

      if (headingLevel > precedingHeadingLevel + 1) {
        errors.push({
          boundingBox: getNodeBoundingBox(editor, pos),
          correct: documentCorrectorMap[documentValidations.DOCUMENT_MUST_HAVE_CORRECT_HEADING_ORDER](
            pos,
            (precedingHeadingLevel + 1) as Level,
          ),
          pos,
          severity: validationSeverity.WARNING,
          tipPayload: {
            headingLevel: headingLevel,
            precedingHeadingLevel: precedingHeadingLevel,
            topHeadingLevel: topHeadingLevel,
          },
        });
      }

      precedingHeadingLevel = headingLevel;
    }
  });

  return errors;
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

    if ($blocks[index + 1]?.node.type.name === 'paragraph') {
      const secondPrefix = $blocks[index + 1].node.textContent.substring(0, 2);
      const decrementedSecondPrefix = decrement(secondPrefix);
      if (decrementedSecondPrefix === firstPrefix) {
        errors.push({
          boundingBox: getNodeBoundingBox(editor, pos),
          correct: documentCorrectorMap[documentValidations.DOCUMENT_MUST_HAVE_SEMANTIC_LISTS](pos, isOrdered),
          pos,
          severity: validationSeverity.INFO,
          tipPayload: { prefix: firstPrefix.trim() },
        });
      }
    }

    const lines = getParagraphLines(node);
    if (lines.length > 1 && firstPrefix === decrement(lines[1].substring(0, 2))) {
      errors.push({
        boundingBox: getNodeBoundingBox(editor, pos),
        correct: documentCorrectorMap[documentValidations.DOCUMENT_MUST_HAVE_SEMANTIC_LISTS](pos, isOrdered),
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

    return incorrectHeadingOneNodes.map(({ pos }) => ({
      boundingBox: getNodeBoundingBox(editor, pos),
      correct: documentCorrectorMap[documentValidations.DOCUMENT_MUST_HAVE_SINGLE_HEADING_ONE](pos),
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
        boundingBox: getNodeBoundingBox(editor, 1),
        correct: documentCorrectorMap[documentValidations.DOCUMENT_MUST_HAVE_TOP_LEVEL_HEADING_ONE](),
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
        boundingBox: getNodeBoundingBox(editor, pos),
        correct: documentCorrectorMap[documentValidations.DOCUMENT_SHOULD_NOT_HAVE_HEADING_RESEMBLING_PARAGRAPHS](
          pos,
          node.nodeSize,
        ),
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

    let firstRow: Node | undefined;
    node.descendants((child: Node) => {
      if (!firstRow && child.type.name === 'tableRow') {
        firstRow = child;
        return false;
      }
      return true;
    });

    if (firstRow) {
      hasHeaderRow = firstRow.content.content.every((cell: Node) => cell.type.name === 'tableHeader');
    }

    if (!hasHeaderRow) {
      const firstCells: Node[] = [];
      node.descendants((row: Node) => {
        if (row.type.name === 'tableRow' && row.firstChild) {
          firstCells.push(row.firstChild);
        }
      });

      hasHeaderColumn = firstCells.length > 0 && firstCells.every((cell: Node) => cell.type.name === 'tableHeader');
    }

    if (!hasHeaderRow && !hasHeaderColumn) {
      errors.push({
        boundingBox: getNodeBoundingBox(editor, pos),
        correct: documentCorrectorMap[documentValidations.DOCUMENT_MUST_HAVE_TABLE_WITH_HEADINGS](pos),
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
        boundingBox: getNodeBoundingBox(editor, pos),
        correct: documentCorrectorMap[documentValidations.DOCUMENT_MUST_HAVE_TABLE_WITH_MULTIPLE_ROWS](pos),
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
