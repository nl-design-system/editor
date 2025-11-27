import type { Editor } from '@tiptap/core';
import type { Node } from 'prosemirror-model';
import type { EditorSettings } from '@/types/settings.ts';
import type { DocumentValidator, ValidationResult } from '@/types/validation.ts';
import { documentValidations, validationSeverity } from '@/validators/constants.ts';
import { getNodeBoundingBox, isBold } from '@/validators/helpers.ts';

const documentValidators = new Map<string, DocumentValidator>();

export const documentMustHaveCorrectHeadingOrder = (editor: Editor): ValidationResult[] => {
  const errors: ValidationResult[] = [];
  let precedingHeadingLevel = 0;

  editor.$doc.node.descendants((node, pos) => {
    if (node.type.name === 'heading') {
      const headingLevel = node.attrs['level'];
      if (headingLevel > precedingHeadingLevel + 1) {
        errors.push({
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
        pos,
        severity: validationSeverity.INFO,
        tipPayload: { prefix: firstPrefix.trim() },
      });
    }
  }
  return errors;
};

export const documentMustHaveTopLevelHeading = (editor: Editor, settings?: EditorSettings): ValidationResult[] => {
  const { firstChild } = editor.$doc.node;
  const topHeadingLevel = settings?.topHeadingLevel ?? 1;
  if (firstChild?.attrs['level'] !== topHeadingLevel) {
    return [
      {
        boundingBox: null,
        pos: 0,
        severity: validationSeverity.INFO,
        tipPayload: { topHeadingLevel },
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
    if (
      node.type.name === 'paragraph' &&
      isDirectChildOfDoc(editor, pos) &&
      node.marks.every(isBold) &&
      node.textContent.trim().length <= 60
    ) {
      errors.push({
        boundingBox: getNodeBoundingBox(editor, pos),
        pos,
        severity: validationSeverity.INFO,
      });
    }
  });

  return errors;
};

type DocumentValidationKey = (typeof documentValidations)[keyof typeof documentValidations];

const documentValidatorMap: { [K in DocumentValidationKey]: DocumentValidator } = {
  [documentValidations.DOCUMENT_MUST_HAVE_CORRECT_HEADING_ORDER]: documentMustHaveCorrectHeadingOrder,
  [documentValidations.DOCUMENT_MUST_HAVE_SEMANTIC_LISTS]: documentMustHaveSemanticLists,
  [documentValidations.DOCUMENT_MUST_HAVE_TOP_LEVEL_HEADING]: documentMustHaveTopLevelHeading,
  [documentValidations.DOCUMENT_SHOULD_NOT_HAVE_HEADING_RESEMBLING_PARAGRAPHS]:
    documentShouldNotHaveHeadingResemblingParagraphs,
};

for (const [key, validator] of Object.entries(documentValidatorMap)) {
  documentValidators.set(key, validator);
}

export default documentValidators;
