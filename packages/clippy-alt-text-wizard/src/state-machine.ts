import { assign, setup } from 'xstate';

// ---------------------------------------------------------------------------
// Domain value objects (no enum — erasableSyntaxOnly is enabled)
// ---------------------------------------------------------------------------

export const ImageType = {
  Decorative: 'decorative',
  Functional: 'functional',
  ImageOfText: 'image-of-text',
  Informative: 'informative',
  Logo: 'logo',
} as const;
export type ImageType = (typeof ImageType)[keyof typeof ImageType];

export const DecorativeCheck = {
  No: 'no',
  Yes: 'yes',
} as const;
export type DecorativeCheck = (typeof DecorativeCheck)[keyof typeof DecorativeCheck];

export const InformativeType = {
  ClickableWithoutText: 'clickable-without-text',
  ClickableWithText: 'clickable-with-text',
  DecorativeAfterAll: 'decorative-after-all',
  Informative: 'informative',
} as const;
export type InformativeType = (typeof InformativeType)[keyof typeof InformativeType];

// ---------------------------------------------------------------------------
// Context — accumulated answers
// ---------------------------------------------------------------------------

export interface AltTextWizardContext {
  decorativeCheck: DecorativeCheck | null;
  imageType: ImageType | null;
  informativeType: InformativeType | null;
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

export type BackEvent = {
  type: 'BACK';
};

export type SelectDecorativeCheckEvent = {
  type: 'SELECT_DECORATIVE_CHECK';
  value: DecorativeCheck;
};

export type SelectImageTypeEvent = {
  type: 'SELECT_IMAGE_TYPE';
  value: ImageType;
};

export type SelectInformativeTypeEvent = {
  type: 'SELECT_INFORMATIVE_TYPE';
  value: InformativeType;
};

export type AltTextWizardEvent =
  | BackEvent
  | SelectDecorativeCheckEvent
  | SelectImageTypeEvent
  | SelectInformativeTypeEvent;

// ---------------------------------------------------------------------------
// Machine
// ---------------------------------------------------------------------------

export const altTextWizardMachine = setup({
  actions: {
    assignDecorativeCheck: assign({
      decorativeCheck: ({ event }) => {
        if (event.type === 'SELECT_DECORATIVE_CHECK') return event.value;
        return null;
      },
    }),
    assignImageType: assign({
      imageType: ({ event }) => {
        if (event.type === 'SELECT_IMAGE_TYPE') return event.value;
        return null;
      },
    }),
    assignInformativeType: assign({
      informativeType: ({ event }) => {
        if (event.type === 'SELECT_INFORMATIVE_TYPE') return event.value;
        return null;
      },
    }),
    resetImageType: assign({
      decorativeCheck: null,
      imageType: null,
      informativeType: null,
    }),
    resetSubAnswers: assign({
      decorativeCheck: null,
      informativeType: null,
    }),
  },
  types: {
    context: {} as AltTextWizardContext,
    events: {} as AltTextWizardEvent,
  },
}).createMachine({
  id: 'altTextWizard',
  context: {
    decorativeCheck: null,
    imageType: null,
    informativeType: null,
  },
  initial: 'imageType',
  states: {
    decorativeCheck: {
      on: {
        BACK: {
          actions: 'resetImageType',
          target: 'imageType',
        },
        SELECT_DECORATIVE_CHECK: {
          actions: 'assignDecorativeCheck',
          target: 'result',
        },
      },
    },
    imageType: {
      on: {
        SELECT_IMAGE_TYPE: [
          {
            actions: ['assignImageType', 'resetSubAnswers'],
            guard: ({ event }) => event.value === ImageType.Decorative,
            target: 'decorativeCheck',
          },
          {
            actions: ['assignImageType', 'resetSubAnswers'],
            guard: ({ event }) => event.value === ImageType.Informative,
            target: 'informativeType',
          },
          {
            actions: ['assignImageType', 'resetSubAnswers'],
            target: 'result',
          },
        ],
      },
    },
    informativeType: {
      on: {
        BACK: {
          actions: 'resetImageType',
          target: 'imageType',
        },
        SELECT_INFORMATIVE_TYPE: {
          actions: 'assignInformativeType',
          target: 'result',
        },
      },
    },
    result: {
      on: {
        BACK: [
          {
            guard: ({ context }) => context.imageType === ImageType.Decorative,
            target: 'decorativeCheck',
          },
          {
            guard: ({ context }) => context.imageType === ImageType.Informative,
            target: 'informativeType',
          },
          {
            actions: 'resetImageType',
            target: 'imageType',
          },
        ],
      },
    },
  },
});
