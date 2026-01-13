import { contentValidations, documentValidations } from '@/validators/constants.ts';

type TipFn = (args?: Record<string, number | string | boolean>) => string | null;

type ContentValidationKey = (typeof contentValidations)[keyof typeof contentValidations];
type DocumentValidationKey = (typeof documentValidations)[keyof typeof documentValidations];
export type ValidationKey = ContentValidationKey | DocumentValidationKey;

type ValidationMessages = {
  [K in ValidationKey]: { description: string; href?: string; tip?: TipFn };
};

export const nodeTypesTranslations: Record<string, string> = {
  definitionDescription: 'definitiebeschrijving',
  definitionTerm: 'definitieterm',
  link: 'linktekst',
  listItem: 'lijstregel',
  paragraph: 'paragraaf',
  tableCell: 'tabelcel',
  tableHeader: 'tabelkop',
};

export const validationMessages: ValidationMessages = {
  [contentValidations.DEFINITION_DESCRIPTION_MUST_FOLLOW_TERM]: {
    description: 'Definitiebeschrijving moet volgen op een definitieterm',
  },
  [contentValidations.DESCRIPTION_LIST_MUST_CONTAIN_TERM]: {
    description: 'Definitielijst moet een definitieterm bevatten',
  },
  [contentValidations.HEADING_MUST_NOT_BE_EMPTY]: {
    description: 'Koptekst mag niet leeg zijn',
    href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/koppen/#voor-wie-zijn-toegankelijke-koppen-belangrijk',
  },
  [contentValidations.HEADING_SHOULD_NOT_CONTAIN_BOLD_OR_ITALIC]: {
    description: 'Koptekst mag geen vetgedrukte of cursieve tekst bevatten',
  },
  [contentValidations.IMAGE_MUST_HAVE_ALT_TEXT]: {
    description: 'Afbeelding moet alternatieve tekst hebben',
  },
  [contentValidations.LINK_SHOULD_NOT_BE_TOO_GENERIC]: {
    description: 'Linktekst mag niet te algemeen zijn',
    href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/linkteksten/',
  },
  [contentValidations.MARK_SHOULD_NOT_BE_EMPTY]: {
    description: 'Link mag niet leeg zijn',
    tip: (params) => {
      const { nodeType } = params || {};
      if (!nodeType || typeof nodeType !== 'string') {
        return null;
      }
      return `Vul de <strong>${nodeTypesTranslations[nodeType]}</strong> met tekst of verwijder de lege link.`;
    },
  },
  [contentValidations.MARK_SHOULD_NOT_BE_UNDERLINED]: {
    description: 'Tekst mag niet onderstreept zijn. Dit lijkt te veel op een link.',
    href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/tekst-benadrukken/#onderstrepen',
    tip: () => `Verwijder de onderstreping van de tekst.`,
  },
  [contentValidations.NODE_SHOULD_NOT_BE_EMPTY]: {
    description: 'Vermijd lege elementen',
    tip: (params) => {
      const { nodeType } = params || {};
      if (!nodeType || typeof nodeType !== 'string') {
        return null;
      }
      return `Verwijder de lege <strong>${nodeTypesTranslations[nodeType]}</strong> of voeg tekst toe.`;
    },
  },
  [documentValidations.DOCUMENT_MUST_HAVE_CORRECT_HEADING_ORDER]: {
    description: 'Document moet correcte kopvolgorde hebben',
    href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/koppen/#kopniveaus',
    tip: (params) => {
      const { exceedsTopLevel, headingLevel, precedingHeadingLevel } = params || {};

      if (exceedsTopLevel) {
        return `<strong>Kopniveau ${headingLevel}</strong> overschrijdt het hoogste toegestane kopniveau (${precedingHeadingLevel}) in dit document.`;
      }

      if (typeof precedingHeadingLevel !== 'number' || !headingLevel) {
        return null;
      }

      if (precedingHeadingLevel === 0) {
        return `<strong>Kopniveau ${headingLevel}</strong> mag niet het eerste kopniveau in het document zijn.`;
      }

      return `<strong>Kopniveau ${headingLevel}</strong> mag niet direct volgen op een
        <strong>kopniveau ${precedingHeadingLevel}</strong>. Gebruik een koptekst op niveau ${precedingHeadingLevel + 1}
        of lager.`;
    },
  },
  [documentValidations.DOCUMENT_MUST_HAVE_SEMANTIC_LISTS]: {
    description: 'Lijst moet een semantische lijst zijn',
    href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/opsommingen/#genummerde-en-ongenummerde-lijsten',
    tip: (params) => {
      const { prefix } = params || {};
      if (!prefix) {
        return null;
      }
      return `Gebruik een semantische lijst in plaats van regels die beginnen met "<strong>${prefix}</strong>"`;
    },
  },
  [documentValidations.DOCUMENT_MUST_HAVE_SINGLE_HEADING_ONE]: {
    description: 'Document mag maar één kopniveau 1 hebben',
    href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/koppen',
  },
  [documentValidations.DOCUMENT_MUST_HAVE_TABLE_WITH_HEADINGS]: {
    description: 'Tabel moet kopteksten bevatten',
  },
  [documentValidations.DOCUMENT_MUST_HAVE_TABLE_WITH_MULTIPLE_ROWS]: {
    description: 'Tabel moet meerdere rijen bevatten',
  },
  [documentValidations.DOCUMENT_MUST_HAVE_TOP_LEVEL_HEADING_ONE]: {
    description: 'Document moet starten met het kopniveau 1',
  },
  [documentValidations.DOCUMENT_SHOULD_NOT_HAVE_HEADING_RESEMBLING_PARAGRAPHS]: {
    description: 'Paragraaf die op een koptekst lijkt vermijden',
    href: 'https://nldesignsystem.nl/richtlijnen/content/tekstopmaak/koppen/#opmaak-van-koppen',
  },
} as const;
