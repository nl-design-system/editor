import { setup } from 'xstate';

export type AltTextWizardEvent = { type: 'ANSWER_NO' } | { type: 'ANSWER_YES' } | { type: 'BACK' };

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
    },

    complexInformativeResult: {
      on: {
        BACK: 'isInfoSimple',
      },
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
    },

    functionalWithoutTextResult: {
      on: {
        BACK: 'containsText',
      },
    },

    functionalWithSupplementaryTextResult: {
      on: {
        BACK: 'canPlaceTextBeside',
      },
    },

    functionalWithTextResult: {
      on: {
        BACK: 'canPlaceTextBeside',
      },
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
    },

    simpleInformativeResult: {
      on: {
        BACK: 'isInfoSimple',
      },
    },
  },
});
