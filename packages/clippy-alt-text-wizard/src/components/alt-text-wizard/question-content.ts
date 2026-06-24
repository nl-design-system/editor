import { msg } from '@lit/localize';
import type { AltTextWizardQuestionState, AltTextWizardState } from '@/state-machine.ts';

export interface QuestionStepContent {
  questionId: string;
  questionText: unknown;
  showBack: boolean;
}

/**
 * Returns the content map for all question steps.
 * Must be called inside `render()` so `msg()` resolves in the correct `@localized()` context.
 */
export function getQuestionContent(): ReadonlyMap<AltTextWizardState, QuestionStepContent> {
  return new Map<AltTextWizardQuestionState, QuestionStepContent>([
    [
      'informationLost',
      {
        questionId: 'informationLost',
        questionText: msg('If I remove the image, will information be lost?', { id: 'question-information-lost' }),
        showBack: false,
      },
    ],
    [
      'isClickable',
      {
        questionId: 'isClickable',
        questionText: msg('Is the image clickable (link, button)?', { id: 'question-is-clickable' }),
        showBack: true,
      },
    ],
    [
      'isLogoClickable',
      {
        questionId: 'isLogoClickable',
        questionText: msg('Is the image a logo?', { id: 'question-is-logo-clickable' }),
        showBack: true,
      },
    ],
    [
      'containsText',
      {
        questionId: 'containsText',
        questionText: msg('Does the image contain text?', { id: 'question-contains-text' }),
        showBack: true,
      },
    ],
    [
      'canPlaceTextBeside',
      {
        questionId: 'canPlaceTextBeside',
        questionText: msg('Can you also place the text in or next to the image?', {
          id: 'question-can-place-text-beside',
        }),
        showBack: true,
      },
    ],
    [
      'isLogo',
      {
        questionId: 'isLogo',
        questionText: msg('Is it a logo?', { id: 'question-is-logo' }),
        showBack: true,
      },
    ],
    [
      'containsUniqueInfo',
      {
        questionId: 'containsUniqueInfo',
        questionText: msg(
          'Does the image contain information that is not available as text on the page and is necessary to understand the content?',
          { id: 'question-contains-unique-info' },
        ),
        showBack: true,
      },
    ],
    [
      'isInfoSimple',
      {
        questionId: 'isInfoSimple',
        questionText: msg('Is the information short and simple (2-3 lines)?', { id: 'question-is-info-simple' }),
        showBack: true,
      },
    ],
  ]);
}
