import type { Element } from 'ckeditor5';
import type { DocumentValidator } from '../types/';
import { documentValidations, validationSeverity } from '../constants/';
import { walkElements, getHeadingLevel } from './helpers.ts';

const documentMustHaveSingleHeadingOne: DocumentValidator = (root) => {
  const headingOnes: Element[] = [];

  for (const element of walkElements(root)) {
    if (getHeadingLevel(element.name) === 1) {
      headingOnes.push(element);
    }
  }

  if (headingOnes.length <= 1) {
    return [];
  }

  return headingOnes.slice(1).map((element) => ({
    boundingBox: null,
    element,
    ruleId: documentValidations.DOCUMENT_MUST_HAVE_SINGLE_HEADING_ONE,
    severity: validationSeverity.ERROR,
  }));
};

export const documentValidators: DocumentValidator[] = [documentMustHaveSingleHeadingOne];
