import {
  definitionListValidations,
  headingValidations,
  imageValidations,
  linkValidations,
  paragraphValidations,
  richTextContentValidations,
  tableValidations,
} from '@/constants';
import type { ValidationTranslations } from './types';
import { orList } from './format';

export const en: ValidationTranslations = {
  [definitionListValidations.DEFINITION_DESCRIPTION_MUST_FOLLOW_TERM]: {
    heading: 'Definition description must follow a definition term',
  },
  [definitionListValidations.DESCRIPTION_LIST_MUST_CONTAIN_TERM]: {
    heading: 'Definition list must contain a definition term',
  },
  [headingValidations.DOCUMENT_MUST_HAVE_CORRECT_HEADING_ORDER]: {
    heading: 'Document must have correct heading order',
    href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/koppen/#kopniveaus',
    solution: ({ aboveTopLevel, allowedLevels, headingLevel, precedingHeadingLevel }) =>
      aboveTopLevel
        ? `**Heading level ${headingLevel}** exceeds the highest allowed heading level (${precedingHeadingLevel}) in this document.`
        : `**Heading level ${headingLevel}** must not directly follow a **heading level ${precedingHeadingLevel}**. Use heading level ${orList(allowedLevels as number[], 'en')}.`,
  },
  [headingValidations.DOCUMENT_MUST_HAVE_SINGLE_HEADING_ONE]: {
    heading: 'Document must have only one heading level 1',
    href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/koppen',
  },
  [headingValidations.DOCUMENT_MUST_HAVE_TOP_LEVEL_HEADING_ONE]: {
    heading: 'Document must start with heading level 1',
  },
  [headingValidations.HEADING_MUST_NOT_BE_EMPTY]: {
    heading: 'Heading must not be empty',
    href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/koppen/#voor-wie-zijn-toegankelijke-koppen-belangrijk',
  },
  [headingValidations.HEADING_SHOULD_NOT_CONTAIN_BOLD_OR_ITALIC]: {
    heading: 'Heading should not contain bold or italic text',
    solution: 'Remove the bold or italic formatting from the text in the heading.',
  },
  [imageValidations.IMAGE_MUST_HAVE_ALT_TEXT]: {
    correctLabel: 'Edit',
    heading: 'Image must have alternative text',
    solution: 'Edit the image to supply an alt text',
  },
  [linkValidations.LINK_SHOULD_NOT_BE_TOO_GENERIC]: {
    heading: 'Link text should not be too generic',
    href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/linkteksten/',
  },
  nodeTypes: {
    bold: 'bold',
    code: 'code',
    definitionDescription: 'definition description',
    definitionTerm: 'definition term',
    highlight: 'highlight',
    italic: 'italic text',
    link: 'link text',
    listItem: 'list item',
    paragraph: 'paragraph',
    strike: 'strike',
    tableCaption: 'table caption',
    tableCell: 'table cell',
    tableHeader: 'table header',
    underline: 'underline',
  },
  [paragraphValidations.PARAGRAPH_SHOULD_NOT_BE_ENTIRELY_BOLD]: {
    heading: 'Avoid making an entire paragraph bold',
    href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/tekst-benadrukken/',
    solution: 'Remove the bold formatting from the paragraph.',
  },
  [paragraphValidations.PARAGRAPH_SHOULD_NOT_RESEMBLE_HEADING]: {
    heading: 'Avoid paragraphs that resemble headings',
    href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/koppen/#opmaak-van-koppen',
  },
  [paragraphValidations.PARAGRAPH_SHOULD_NOT_RESEMBLE_LIST]: {
    heading: 'List must be a semantic list',
    href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/opsommingen/#genummerde-en-ongenummerde-lijsten',
    solution: 'Use a semantic list instead of lines starting with "**{{prefix}}**"',
  },
  [richTextContentValidations.INLINE_SHOULD_NOT_BE_EMPTY]: {
    heading: 'Element must not be empty',
    solution: 'Remove the empty **{{nodeType}}**.',
  },
  [richTextContentValidations.INLINE_SHOULD_NOT_BE_UNDERLINED]: {
    heading: 'Text should not be underlined. This looks too much like a link.',
    href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/tekst-benadrukken/#onderstrepen',
    solution: 'Remove the underline from the text.',
  },
  [richTextContentValidations.NODE_SHOULD_NOT_BE_EMPTY]: {
    heading: 'Avoid empty elements',
    solution: 'Remove the empty **{{nodeType}}** or add text.',
  },
  [tableValidations.TABLE_MUST_HAVE_HEADINGS]: {
    heading: 'Table must contain headings',
  },
  [tableValidations.TABLE_MUST_HAVE_MULTIPLE_ROWS]: {
    heading: 'Table must contain multiple rows',
  },
};
