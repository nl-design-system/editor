import type { Editor } from '@tiptap/core';
import type { EditorSettings } from '@/types/settings.ts';
import type { DocumentValidator, ValidationResult } from '@/types/validation.ts';
import { documentValidations, validationSeverity } from '@/validators/constants.ts';
import { getNodeBoundingBox } from '@/validators/helpers.ts';

const documentValidators = new Map<string, DocumentValidator>();

export const documentMustHaveCorrectHeadingOrder = (editor: Editor): ValidationResult | null => {
  let errorHeadingLevel = 0;
  let errorPrecedingHeadingLevel = 0;

  let precedingHeadingLevel = 0;
  let errorPosition: number | null = null;
  editor.$doc.node.descendants((node, pos) => {
    if (node.type.name === 'heading') {
      const headingLevel = node.attrs['level'];
      if (headingLevel > precedingHeadingLevel + 1) {
        errorPosition = pos;
        errorPrecedingHeadingLevel = precedingHeadingLevel;
        errorHeadingLevel = headingLevel;
      }
      precedingHeadingLevel = headingLevel;
    }
  });
  if (errorPosition) {
    return {
      boundingBox: getNodeBoundingBox(editor, errorPosition),
      pos: errorPosition,
      severity: validationSeverity.WARNING,
      tipPayload: { headingLevel: errorHeadingLevel, precedingHeadingLevel: errorPrecedingHeadingLevel },
    };
  }
  return null;
};

export const documentMustHaveTopLevelHeading = (editor: Editor, settings: EditorSettings): ValidationResult | null => {
  const { firstChild } = editor.$doc.node;
  if (firstChild?.attrs['level'] !== settings.topHeadingLevel) {
    return {
      boundingBox: null,
      pos: 0,
      severity: validationSeverity.INFO,
      tipPayload: { topHeadingLevel: settings.topHeadingLevel },
    };
  }
  return null;
};

type DocumentValidationKey = (typeof documentValidations)[keyof typeof documentValidations];

const documentValidatorMap: { [K in DocumentValidationKey]: DocumentValidator } = {
  [documentValidations.DOCUMENT_MUST_HAVE_CORRECT_HEADING_ORDER]: documentMustHaveCorrectHeadingOrder,
  [documentValidations.DOCUMENT_MUST_HAVE_TOP_LEVEL_HEADING]: documentMustHaveTopLevelHeading,
};

for (const [key, validator] of Object.entries(documentValidatorMap)) {
  documentValidators.set(key, validator);
}

export default documentValidators;
