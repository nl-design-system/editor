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
  | 'ambientResult'
  | 'clickableLogoResult'
  | 'complexInformativeResult'
  | 'decorativeResult'
  | 'functionalWithSupplementaryTextResult'
  | 'functionalWithTextResult'
  | 'functionalWithoutTextResult'
  | 'logoResult'
  | 'simpleInformativeResult';

export type AltTextWizardState = AltTextWizardQuestionState | AltTextWizardResultState;

export const altTextWizardMachine = setup({
  types: {
    events: {} as AltTextWizardEvent,
  },
}).createMachine({
  id: 'altTextWizard',
  initial: 'informationLost',
  states: {
    ambientResult: {
      on: {
        BACK: 'containsUniqueInfo',
      },
      type: 'final',
    },

    canPlaceTextBeside: {
      on: {
        ANSWER_NO: 'functionalWithTextResult',
        ANSWER_YES: 'functionalWithSupplementaryTextResult',
        BACK: 'containsText',
      },
    },

    clickableLogoResult: {
      on: {
        BACK: 'isLogoClickable',
      },
      type: 'final',
    },

    complexInformativeResult: {
      on: {
        BACK: 'isInfoSimple',
      },
      type: 'final',
    },

    containsText: {
      on: {
        ANSWER_NO: 'functionalWithoutTextResult',
        ANSWER_YES: 'canPlaceTextBeside',
        BACK: 'isLogoClickable',
      },
    },

    containsUniqueInfo: {
      on: {
        ANSWER_NO: 'ambientResult',
        ANSWER_YES: 'isInfoSimple',
        BACK: 'isLogo',
      },
    },

    decorativeResult: {
      on: {
        BACK: 'informationLost',
      },
      type: 'final',
    },

    functionalWithoutTextResult: {
      on: {
        BACK: 'containsText',
      },
      type: 'final',
    },

    functionalWithSupplementaryTextResult: {
      on: {
        BACK: 'canPlaceTextBeside',
      },
      type: 'final',
    },

    functionalWithTextResult: {
      on: {
        BACK: 'canPlaceTextBeside',
      },
      type: 'final',
    },

    informationLost: {
      on: {
        ANSWER_NO: 'decorativeResult',
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
        ANSWER_NO: 'complexInformativeResult',
        ANSWER_YES: 'simpleInformativeResult',
        BACK: 'containsUniqueInfo',
      },
    },

    isLogo: {
      on: {
        ANSWER_NO: 'containsUniqueInfo',
        ANSWER_YES: 'logoResult',
        BACK: 'isClickable',
      },
    },

    isLogoClickable: {
      on: {
        ANSWER_NO: 'containsText',
        ANSWER_YES: 'clickableLogoResult',
        BACK: 'isClickable',
      },
    },

    logoResult: {
      on: {
        BACK: 'isLogo',
      },
      type: 'final',
    },

    simpleInformativeResult: {
      on: {
        BACK: 'isInfoSimple',
      },
      type: 'final',
    },
  },
});
