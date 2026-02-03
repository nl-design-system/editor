import type { ValidationMessages } from '@/messages';
import { contentValidations, documentValidations } from '@/validators/constants.ts';

export const nodeTypesTranslations: Record<string, string> = {
  definitionDescription: 'definition description',
  definitionTerm: 'definition term',
  link: 'link text',
  listItem: 'list item',
  paragraph: 'paragraph',
  tableCell: 'table cell',
  tableHeader: 'table header',
};

export const validationMessages: ValidationMessages = {
  [contentValidations.DEFINITION_DESCRIPTION_MUST_FOLLOW_TERM]: {
    description: 'Definition description must follow a definition term',
  },
  [contentValidations.DESCRIPTION_LIST_MUST_CONTAIN_TERM]: {
    description: 'Definition list must contain a definition term',
  },
  [contentValidations.HEADING_MUST_NOT_BE_EMPTY]: {
    description: 'Heading must not be empty',
    href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/koppen/#voor-wie-zijn-toegankelijke-koppen-belangrijk',
  },
  [contentValidations.HEADING_SHOULD_NOT_CONTAIN_BOLD_OR_ITALIC]: {
    description: 'Heading should not contain bold or italic text',
  },
  [contentValidations.IMAGE_MUST_HAVE_ALT_TEXT]: {
    description: 'Image must have alternative text',
  },
  [contentValidations.LINK_SHOULD_NOT_BE_TOO_GENERIC]: {
    description: 'Link text should not be too generic',
    href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/linkteksten/',
  },
  [contentValidations.MARK_SHOULD_NOT_BE_EMPTY]: {
    description: 'Link must not be empty',
    tip: (params) => {
      const { nodeType } = params || {};
      if (!nodeType || typeof nodeType !== 'string') {
        return null;
      }
      return `Fill the <strong>${nodeTypesTranslations[nodeType]}</strong> with text or remove the empty link.`;
    },
  },
  [contentValidations.MARK_SHOULD_NOT_BE_UNDERLINED]: {
    description: 'Text should not be underlined. This looks too much like a link.',
    href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/tekst-benadrukken/#onderstrepen',
    tip: () => `Remove the underline from the text.`,
  },
  [contentValidations.NODE_SHOULD_NOT_BE_EMPTY]: {
    description: 'Avoid empty elements',
    tip: (params) => {
      const { nodeType } = params || {};
      if (!nodeType || typeof nodeType !== 'string') {
        return null;
      }
      return `Remove the empty <strong>${nodeTypesTranslations[nodeType]}</strong> or add text.`;
    },
  },
  [documentValidations.DOCUMENT_MUST_HAVE_CORRECT_HEADING_ORDER]: {
    description: 'Document must have correct heading order',
    href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/koppen/#kopniveaus',
    tip: (params) => {
      const { exceedsTopLevel, headingLevel, precedingHeadingLevel } = params || {};

      if (exceedsTopLevel) {
        return `<strong>Heading level ${headingLevel}</strong> exceeds the highest allowed heading level (${precedingHeadingLevel}) in this document.`;
      }

      if (typeof precedingHeadingLevel !== 'number' || !headingLevel) {
        return null;
      }

      if (precedingHeadingLevel === 0) {
        return `<strong>Heading level ${headingLevel}</strong> must not be the first heading level in the document.`;
      }

      return `<strong>Heading level ${headingLevel}</strong> must not directly follow a
        <strong>heading level ${precedingHeadingLevel}</strong>. Use a heading at level ${precedingHeadingLevel + 1}
        or lower.`;
    },
  },
  [documentValidations.DOCUMENT_MUST_HAVE_SEMANTIC_LISTS]: {
    description: 'List must be a semantic list',
    href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/opsommingen/#genummerde-en-ongenummerde-lijsten',
    tip: (params) => {
      const { prefix } = params || {};
      if (!prefix) {
        return null;
      }
      return `Use a semantic list instead of lines starting with "<strong>${prefix}</strong>"`;
    },
  },
  [documentValidations.DOCUMENT_MUST_HAVE_SINGLE_HEADING_ONE]: {
    description: 'Document must have only one heading level 1',
    href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/koppen',
  },
  [documentValidations.DOCUMENT_MUST_HAVE_TABLE_WITH_HEADINGS]: {
    description: 'Table must contain headings',
  },
  [documentValidations.DOCUMENT_MUST_HAVE_TABLE_WITH_MULTIPLE_ROWS]: {
    description: 'Table must contain multiple rows',
  },
  [documentValidations.DOCUMENT_MUST_HAVE_TOP_LEVEL_HEADING_ONE]: {
    description: 'Document must start with heading level 1',
  },
  [documentValidations.DOCUMENT_SHOULD_NOT_HAVE_HEADING_RESEMBLING_PARAGRAPHS]: {
    description: 'Avoid paragraphs that resemble headings',
    href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/koppen/#opmaak-van-koppen',
  },
} as const;
