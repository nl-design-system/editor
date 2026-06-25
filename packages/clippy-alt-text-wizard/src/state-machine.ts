import { setup } from 'xstate';

export type AltTextWizardEvent = { type: 'ANSWER_NO' } | { type: 'ANSWER_YES' } | { type: 'BACK' };

export type AltTextWizardAtomicState =
  | 'atomic_canPlaceTextBeside'
  | 'atomic_containsText'
  | 'atomic_containsUniqueInfo'
  | 'atomic_informationLost'
  | 'atomic_isClickable'
  | 'atomic_isInfoSimple'
  | 'atomic_isLogo'
  | 'atomic_isLogoClickable';

export type AltTextWizardFinalState =
  | 'final_ambient'
  | 'final_clickableLogo'
  | 'final_complexInformative'
  | 'final_decorative'
  | 'final_functionalWithSupplementaryText'
  | 'final_functionalWithText'
  | 'final_functionalWithoutText'
  | 'final_logo'
  | 'final_simpleInformative';

export type AltTextWizardState = AltTextWizardAtomicState | AltTextWizardFinalState;

export const altTextWizardMachine = setup({
  types: {
    events: {} as AltTextWizardEvent,
  },
}).createMachine({
  id: 'altTextWizard',
  initial: 'atomic_informationLost',
  states: {
    atomic_canPlaceTextBeside: {
      on: {
        ANSWER_NO: 'final_functionalWithText',
        ANSWER_YES: 'final_functionalWithSupplementaryText',
        BACK: 'atomic_containsText',
      },
    },

    atomic_containsText: {
      on: {
        ANSWER_NO: 'final_functionalWithoutText',
        ANSWER_YES: 'atomic_canPlaceTextBeside',
        BACK: 'atomic_isLogoClickable',
      },
    },

    atomic_containsUniqueInfo: {
      on: {
        ANSWER_NO: 'final_ambient',
        ANSWER_YES: 'atomic_isInfoSimple',
        BACK: 'atomic_isLogo',
      },
    },

    atomic_informationLost: {
      on: {
        ANSWER_NO: 'final_decorative',
        ANSWER_YES: 'atomic_isClickable',
      },
    },

    atomic_isClickable: {
      on: {
        ANSWER_NO: 'atomic_isLogo',
        ANSWER_YES: 'atomic_isLogoClickable',
        BACK: 'atomic_informationLost',
      },
    },

    atomic_isInfoSimple: {
      on: {
        ANSWER_NO: 'final_complexInformative',
        ANSWER_YES: 'final_simpleInformative',
        BACK: 'atomic_containsUniqueInfo',
      },
    },

    atomic_isLogo: {
      on: {
        ANSWER_NO: 'atomic_containsUniqueInfo',
        ANSWER_YES: 'final_logo',
        BACK: 'atomic_isClickable',
      },
    },

    atomic_isLogoClickable: {
      on: {
        ANSWER_NO: 'atomic_containsText',
        ANSWER_YES: 'final_clickableLogo',
        BACK: 'atomic_isClickable',
      },
    },

    // Final states
    final_ambient: {
      on: {
        BACK: 'atomic_containsUniqueInfo',
      },
      type: 'final',
    },

    final_clickableLogo: {
      on: {
        BACK: 'atomic_isLogoClickable',
      },
      type: 'final',
    },

    final_complexInformative: {
      on: {
        BACK: 'atomic_isInfoSimple',
      },
      type: 'final',
    },

    final_decorative: {
      on: {
        BACK: 'atomic_informationLost',
      },
      type: 'final',
    },

    final_functionalWithoutText: {
      on: {
        BACK: 'atomic_containsText',
      },
      type: 'final',
    },

    final_functionalWithSupplementaryText: {
      on: {
        BACK: 'atomic_canPlaceTextBeside',
      },
      type: 'final',
    },

    final_functionalWithText: {
      on: {
        BACK: 'atomic_canPlaceTextBeside',
      },
      type: 'final',
    },

    final_logo: {
      on: {
        BACK: 'atomic_isLogo',
      },
      type: 'final',
    },

    final_simpleInformative: {
      on: {
        BACK: 'atomic_isInfoSimple',
      },
      type: 'final',
    },
  },
});
