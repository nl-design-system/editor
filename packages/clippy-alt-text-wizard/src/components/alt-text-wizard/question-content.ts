import { msg } from '@lit/localize';
import type { AltTextWizardQuestionState, AltTextWizardState } from '@/state-machine.ts';

export interface QuestionStepContent {
  questionId: string;
  questionText: unknown;
  sectionTitle?: unknown;
  showBack: boolean;
}

/**
 * Returns the content map for all question steps.
 * Must be called inside `render()` so `msg()` resolves in the correct `@localized()` context.
 */
export function getQuestionContent(): ReadonlyMap<AltTextWizardState, QuestionStepContent> {
  return new Map<AltTextWizardQuestionState, QuestionStepContent>([
    [
      'canPlaceTextBeside',
      {
        questionId: 'canPlaceTextBeside',
        questionText: msg('Can you also place the text in or next to the image?'),
        showBack: true,
      },
    ],
    [
      'containsText',
      {
        questionId: 'containsText',
        questionText: msg('Does the image contain text?'),
        showBack: true,
      },
    ],
    [
      'containsUniqueInfo',
      {
        questionId: 'containsUniqueInfo',
        questionText: msg(
          'Does the image contain information that is not available as text on the page and is necessary to understand the content?',
        ),
        showBack: true,
      },
    ],
    [
      'informationLost',
      {
        questionId: 'informationLost',
        questionText: msg('If I remove the image, will information be lost?'),
        sectionTitle: msg('Decorative images'),
        showBack: false,
      },
    ],
    [
      'isClickable',
      {
        questionId: 'isClickable',
        questionText: msg('Is the image clickable (link, button)?'),
        showBack: true,
      },
    ],
    [
      'isInfoSimple',
      {
        questionId: 'isInfoSimple',
        questionText: msg('Is the information short and simple (2-3 lines)?'),
        showBack: true,
      },
    ],
    [
      'isLogo',
      {
        questionId: 'isLogo',
        questionText: msg('Is it a logo?'),
        showBack: true,
      },
    ],
    [
      'isLogoClickable',
      {
        questionId: 'isLogoClickable',
        questionText: msg('Is the image a logo?'),
        sectionTitle: msg('Logo'),
        showBack: true,
      },
    ],
  ]);
}
