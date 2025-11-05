import type { Editor } from '@tiptap/core';
import type { Node } from 'prosemirror-model';
import type { ContentValidator, ValidationResult } from '@/types/validation.ts';
import { contentValidations, validationSeverity } from '@/validators/constants.ts';
import { getNodeBoundingBox } from '@/validators/helpers.ts';

const isEmptyOrWhitespaceString = (str: string): boolean => /^\s*$/.test(str);

const isEmpty = (node: Node): boolean => {
  if (node.type.name === 'text') {
    return !node.text || isEmptyOrWhitespaceString(node.text);
  } else if (node.content?.content) {
    return node.content?.content.every((node) => isEmpty(node));
  }
  return true;
};

const paragraphMustNotBeEmpty = (editor: Editor, node: Node, pos: number): ValidationResult | null => {
  if (node.type.name === 'paragraph' && isEmpty(node)) {
    return {
      boundingBox: getNodeBoundingBox(editor, pos),
      pos,
      severity: 'error',
    };
  }
  return null;
};

const headingMustNotBeEmpty = (editor: Editor, node: Node, pos: number): ValidationResult | null => {
  if (node.type.name === 'heading' && isEmpty(node)) {
    return {
      boundingBox: getNodeBoundingBox(editor, pos),
      pos,
      severity: validationSeverity.ERROR,
    };
  }
  return null;
};

type ContentValidationKey = (typeof contentValidations)[keyof typeof contentValidations];

const contentValidatorMap: { [K in ContentValidationKey]: ContentValidator } = {
  [contentValidations.HEADING_MUST_NOT_BE_EMPTY]: headingMustNotBeEmpty,
  [contentValidations.PARAGRAPH_MUST_NOT_BE_EMPTY]: paragraphMustNotBeEmpty,
};

const contentValidator = (editor: Editor) => {
  const errors: Map<string, ValidationResult> = new Map();
  editor.$doc.node.descendants((node, pos) => {
    for (const [key, validator] of Object.entries(contentValidatorMap)) {
      const result = validator(editor, node, pos);
      if (result) {
        errors.set(key, result);
      }
    }
  });
  return errors;
};

export default contentValidator;
