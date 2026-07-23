import { blockValidations, documentValidations, inlineValidations } from './constants';

type BlockValidationKey = (typeof blockValidations)[keyof typeof blockValidations];
type InlineValidationKey = (typeof inlineValidations)[keyof typeof inlineValidations];
type DocumentValidationKey = (typeof documentValidations)[keyof typeof documentValidations];
export type ValidationKey = BlockValidationKey | DocumentValidationKey | InlineValidationKey;

export type ValidationMessage = {
  description: string;
  href?: string;
};

/**
 * Default English descriptions used for static-analysis reporting.
 *
 * These mirror the wording of the editor's localised UI messages, but are plain
 * strings with no Lit / localisation dependency so they can be printed from a
 * Node terminal. The editor keeps its own localised catalogue for the UI; the
 * rule *keys* are the shared contract that keeps the two aligned.
 */
export const validationMessages: Record<ValidationKey, ValidationMessage> = {
  [blockValidations.DEFINITION_DESCRIPTION_MUST_FOLLOW_TERM]: {
    description: 'Definition description must follow a definition term',
  },
  [blockValidations.DESCRIPTION_LIST_MUST_CONTAIN_TERM]: {
    description: 'Definition list must contain a definition term',
  },
  [blockValidations.HEADING_MUST_NOT_BE_EMPTY]: {
    description: 'Heading must not be empty',
    href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/koppen/#voor-wie-zijn-toegankelijke-koppen-belangrijk',
  },
  [blockValidations.HEADING_SHOULD_NOT_CONTAIN_BOLD_OR_ITALIC]: {
    description: 'Heading should not contain bold or italic text',
  },
  [blockValidations.IMAGE_MUST_HAVE_ALT_TEXT]: {
    description: 'Image must have alternative text',
  },
  [blockValidations.NODE_SHOULD_NOT_BE_EMPTY]: {
    description: 'Avoid empty elements',
  },
  [blockValidations.PARAGRAPH_SHOULD_NOT_RESEMBLE_HEADING]: {
    description: 'Avoid paragraphs that resemble headings',
    href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/koppen/#opmaak-van-koppen',
  },
  [blockValidations.PARAGRAPH_SHOULD_NOT_RESEMBLE_LIST]: {
    description: 'List must be a semantic list',
    href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/opsommingen/#genummerde-en-ongenummerde-lijsten',
  },
  [blockValidations.TABLE_MUST_HAVE_HEADINGS]: {
    description: 'Table must contain headings',
  },
  [blockValidations.TABLE_MUST_HAVE_MULTIPLE_ROWS]: {
    description: 'Table must contain multiple rows',
  },
  [documentValidations.DOCUMENT_MUST_HAVE_CORRECT_HEADING_ORDER]: {
    description: 'Document must have correct heading order',
    href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/koppen/#kopniveaus',
  },
  [documentValidations.DOCUMENT_MUST_HAVE_SINGLE_HEADING_ONE]: {
    description: 'Document must have only one heading level 1',
    href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/koppen',
  },
  [documentValidations.DOCUMENT_MUST_HAVE_TOP_LEVEL_HEADING_ONE]: {
    description: 'Document must start with heading level 1',
  },
  [inlineValidations.INLINE_SHOULD_NOT_BE_EMPTY]: {
    description: 'Element must not be empty',
  },
  [inlineValidations.INLINE_SHOULD_NOT_BE_UNDERLINED]: {
    description: 'Text should not be underlined. This looks too much like a link.',
    href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/tekst-benadrukken/#onderstrepen',
  },
  [inlineValidations.LINK_SHOULD_NOT_BE_TOO_GENERIC]: {
    description: 'Link text should not be too generic',
    href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/linkteksten/',
  },
};
