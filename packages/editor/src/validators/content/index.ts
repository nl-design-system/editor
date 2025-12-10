import type { Editor } from '@tiptap/core';
import type { Node } from 'prosemirror-model';
import type { ContentValidator, ValidationResult } from '@/types/validation.ts';
import { contentValidations, validationSeverity } from '@/validators/constants.ts';
import { getNodeBoundingBox, isBold, isItalic } from '@/validators/helpers.ts';

const isEmptyOrWhitespaceString = (str: string): boolean => /^\s*$/.test(str);

const isEmpty = (node: Node): boolean => {
  if (node.type.name === 'text') {
    return !node.text || isEmptyOrWhitespaceString(node.text);
  } else if (node.content?.content) {
    return node.content?.content.every((node) => isEmpty(node));
  }
  return true;
};

const imageMustHaveAltText = (editor: Editor, node: Node, pos: number): ValidationResult | null => {
  if (node.type.name === 'image' && (!node.attrs['alt'] || isEmptyOrWhitespaceString(node.attrs['alt']))) {
    return {
      boundingBox: getNodeBoundingBox(editor, pos),
      pos,
      severity: validationSeverity.INFO,
    };
  }
  return null;
};

const nodeTypesRequiringContent = new Set([
  'definitionTerm',
  'definitionDescription',
  'paragraph',
  'listItem',
  'tableHeader',
  'tableCell',
]);

const nodeShouldNotBeEmpty = (editor: Editor, node: Node, pos: number): ValidationResult | null => {
  if (nodeTypesRequiringContent.has(node.type.name) && isEmpty(node)) {
    return {
      boundingBox: getNodeBoundingBox(editor, pos),
      pos,
      severity: validationSeverity.INFO,
      tipPayload: {
        nodeType: node.type.name,
      },
    };
  }
  return null;
};

const markShouldNotBeEmpty = (editor: Editor, node: Node, pos: number): ValidationResult | null => {
  if (node.type.name === 'text' && node.marks?.filter((mark) => mark.type.name === 'link').length) {
    if (!node.text || isEmptyOrWhitespaceString(node.text)) {
      return {
        boundingBox: getNodeBoundingBox(editor, pos),
        pos,
        severity: validationSeverity.INFO,
        tipPayload: {
          nodeType: 'link',
        },
      };
    }
  }
  return null;
};

const genericLinkTexts = new Set(['lees meer', 'klik hier']);

const linkShouldNotBeTooGeneric = (editor: Editor, node: Node, pos: number): ValidationResult | null => {
  if (node.type.name === 'text' && node.marks?.filter((mark) => mark.type.name === 'link').length) {
    const text = (node.text ?? node.textContent ?? '').trim().toLowerCase();
    if (genericLinkTexts.has(text)) {
      return {
        boundingBox: getNodeBoundingBox(editor, pos),
        pos,
        severity: validationSeverity.INFO,
      };
    }
  }
  return null;
};

const markShouldNotBeUnderlined = (editor: Editor, node: Node, pos: number): ValidationResult | null => {
  if (node.type.name === 'text' && node.marks?.some((mark) => mark.type.name === 'underline')) {
    return {
      boundingBox: getNodeBoundingBox(editor, pos),
      pos,
      severity: validationSeverity.INFO,
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

const headingShouldNotContainBoldOrItalic = (editor: Editor, node: Node, pos: number): ValidationResult | null => {
  if (node.type.name === 'heading' && (node.marks.some(isBold) || node.marks.some(isItalic))) {
    return {
      boundingBox: getNodeBoundingBox(editor, pos),
      pos,
      severity: validationSeverity.INFO,
    };
  }
  return null;
};

type ContentValidationKey = (typeof contentValidations)[keyof typeof contentValidations];

const contentValidatorMap: { [K in ContentValidationKey]: ContentValidator } = {
  [contentValidations.HEADING_MUST_NOT_BE_EMPTY]: headingMustNotBeEmpty,
  [contentValidations.HEADING_SHOULD_NOT_CONTAIN_BOLD_OR_ITALIC]: headingShouldNotContainBoldOrItalic,
  [contentValidations.IMAGE_MUST_HAVE_ALT_TEXT]: imageMustHaveAltText,
  [contentValidations.LINK_SHOULD_NOT_BE_TOO_GENERIC]: linkShouldNotBeTooGeneric,
  [contentValidations.MARK_SHOULD_NOT_BE_EMPTY]: markShouldNotBeEmpty,
  [contentValidations.MARK_SHOULD_NOT_BE_UNDERLINED]: markShouldNotBeUnderlined,
  [contentValidations.NODE_SHOULD_NOT_BE_EMPTY]: nodeShouldNotBeEmpty,
};

const contentValidator = (document: HTMLElement) => {
  const errors: Map<string, ValidationResult> = new Map();
  // editor.$doc.node.descendants((node, pos) => {
  //   for (const [key, validator] of Object.entries(contentValidatorMap)) {
  //     const result = validator(editor, node, pos);
  //     if (result) {
  //       errors.set(`${key}_${pos}`, result);
  //     }
  //   }
  // });
  return errors;
};

export default contentValidator;
