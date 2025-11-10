import type { Editor } from '@tiptap/core';
import type { Node } from 'prosemirror-model';
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

export const documentMustHaveSemanticLists = (editor: Editor): ValidationResult | null => {
  if (!editor.$nodes('paragraph')?.length) {
    return null;
  }
  const $paragraphs: Node[] = [];
  editor.$doc.node.descendants((node: Node) => {
    if (node.type.name === 'paragraph') {
      $paragraphs.push(node);
    }
  });

  // Set up checks for types of strings.
  const numberMatch = new RegExp(/(([023456789][\d\s])|(1\d))/, ''); // All numbers but 1.
  const alphabeticMatch = /(^[aA1]|[^\p{Alphabetic}\s])[-\s.)]/u;

  const secondTextNoMatch = ['a', 'A', '1'];
  const prefixDecrement = {
    '2': '1',
    b: 'a',
    B: 'A',
  } as const;
  type PrefixKey = keyof typeof prefixDecrement;
  const isPrefixKey = (s: string): s is PrefixKey => s === '2' || s === 'b' || s === 'B';

  const decrement = (el: string): string =>
    el.replace(/^[bB2]/, (match: string) => (isPrefixKey(match) ? prefixDecrement[match] : match));

  // Variables to carry in loop.
  const activeMatch = ''; // Carried in loop for second paragraph.
  let firstText = ''; // Text of previous paragraph.

  $paragraphs?.forEach((paragraph, i) => {
    let secondText: boolean | string = false;
    let hit = false;
    firstText = firstText ? firstText : paragraph.textContent.replace('(', '');
    const firstPrefix = firstText.substring(0, 2);

    // Grab first two characters.
    const isAlphabetic = firstPrefix.match(alphabeticMatch) !== null;
    const isNumber = firstPrefix.match(numberMatch) !== null;

    console.log('firstPrefix', firstPrefix);
    console.log('activeMatch', activeMatch);
    console.log('!isNumber', !isNumber);
    console.log('isAlphabetic', isAlphabetic);
    console.log('---');
    if (firstPrefix.length > 0 && firstPrefix !== activeMatch && !isNumber && isAlphabetic) {
      // We have a prefix and a possible hit; check next detected paragraph.
      const secondP = $paragraphs[i + 1];
      compareP: if (secondP) {
        secondText = secondP.textContent.replace('(', '').substring(0, 2);
        if (secondTextNoMatch.includes(secondText?.toLowerCase().trim())) {
          break compareP;
        }
        const secondPrefix = decrement(secondText);
        if (isAlphabetic) {
          // Check for repeats (*,*) or increments(a,b)
          if (firstPrefix !== 'A ' && firstPrefix === secondPrefix) {
            hit = true;
          }
        }
      }

      console.log(hit);

      if (!hit) {
        const lines = getParagraphLines(paragraph);
        if (lines.length < 2) {
          return null;
        }

        let textAfterBreak = '';
        console.log(paragraph.content);
        paragraph.content.forEach((child) => {
          if (child.type.name === 'hardBreak') {
            // console.log(paragraph.content[index + 1]);
            // textAfterBreak = paragraph.content[index + 1].textContent;
          }
        });

        if (textAfterBreak) {
          textAfterBreak = textAfterBreak
            .replace(/<\/?[^>]+(>|$)/g, '')
            .replace('(', '')
            .trim()
            .substring(0, 2);
          if (firstPrefix === decrement(textAfterBreak)) {
            hit = true;
          }
        }
      }
      if (hit) {
        // TODO: get position
        return {
          boundingBox: getNodeBoundingBox(editor, 0),
          pos: 0,
          severity: validationSeverity.INFO, // informational: suggest converting to semantic list
        };
      }
      return null;
    }
    return null;
  });
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
  [documentValidations.DOCUMENT_MUST_HAVE_SEMANTIC_LISTS]: documentMustHaveSemanticLists,
  [documentValidations.DOCUMENT_MUST_HAVE_TOP_LEVEL_HEADING]: documentMustHaveTopLevelHeading,
};

for (const [key, validator] of Object.entries(documentValidatorMap)) {
  documentValidators.set(key, validator);
}

export default documentValidators;
