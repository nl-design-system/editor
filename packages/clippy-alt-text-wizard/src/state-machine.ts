import { setup } from 'xstate';

export type AltTextWizardEvent = { type: 'ANSWER_NO' } | { type: 'ANSWER_YES' } | { type: 'BACK' };

export type AltTextWizardQuestionState =
  | 'canPlaceTextBeside'
  | 'containsText'
  | 'containsUniqueInfo'
  | 'informationLost'
  | 'isClickable'
  | 'isInfoSimple'
  | 'isLogo'
  | 'isLogoClickable';

export type AltTextWizardResultState =
  | 'result_ambient'
  | 'result_clickableLogo'
  | 'result_complexInformative'
  | 'result_decorative'
  | 'result_functionalWithSupplementaryText'
  | 'result_functionalWithText'
  | 'result_functionalWithoutText'
  | 'result_logo'
  | 'result_simpleInformative';

export type AltTextWizardState = AltTextWizardQuestionState | AltTextWizardResultState;

export const altTextWizardMachine = setup({
  types: {
    events: {} as AltTextWizardEvent,
  },
}).createMachine({
  id: 'altTextWizard',
  initial: 'informationLost',
  states: {
    canPlaceTextBeside: {
      on: {
        ANSWER_NO: 'result_functionalWithText',
        ANSWER_YES: 'result_functionalWithSupplementaryText',
        BACK: 'containsText',
      },
    },

    containsText: {
      on: {
        ANSWER_NO: 'result_functionalWithoutText',
        ANSWER_YES: 'canPlaceTextBeside',
        BACK: 'isLogoClickable',
      },
    },

    containsUniqueInfo: {
      on: {
        ANSWER_NO: 'result_ambient',
        ANSWER_YES: 'isInfoSimple',
        BACK: 'isLogo',
      },
    },

    informationLost: {
      on: {
        ANSWER_NO: 'result_decorative',
        ANSWER_YES: 'isClickable',
      },
    },

    isClickable: {
      on: {
        ANSWER_NO: 'isLogo',
        ANSWER_YES: 'isLogoClickable',
        BACK: 'informationLost',
      },
    },

    isInfoSimple: {
      on: {
        ANSWER_NO: 'result_complexInformative',
        ANSWER_YES: 'result_simpleInformative',
        BACK: 'containsUniqueInfo',
      },
    },

    isLogo: {
      on: {
        ANSWER_NO: 'containsUniqueInfo',
        ANSWER_YES: 'result_logo',
        BACK: 'isClickable',
      },
    },

    isLogoClickable: {
      on: {
        ANSWER_NO: 'containsText',
        ANSWER_YES: 'result_clickableLogo',
        BACK: 'isClickable',
      },
    },

    // Result states
    result_ambient: {
      on: { BACK: 'containsUniqueInfo' },
    },
    result_clickableLogo: {
      on: { BACK: 'isLogoClickable' },
    },
    result_complexInformative: {
      on: { BACK: 'isInfoSimple' },
    },
    result_decorative: {
      on: { BACK: 'informationLost' },
    },
    result_functionalWithoutText: {
      on: { BACK: 'containsText' },
    },
    result_functionalWithSupplementaryText: {
      on: { BACK: 'canPlaceTextBeside' },
    },
    result_functionalWithText: {
      on: { BACK: 'canPlaceTextBeside' },
    },
    result_logo: {
      on: { BACK: 'isLogo' },
    },
    result_simpleInformative: {
      on: { BACK: 'isInfoSimple' },
    },
  },
});
