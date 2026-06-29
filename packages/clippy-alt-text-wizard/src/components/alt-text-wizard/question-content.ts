import { msg } from '@lit/localize';
import type { AltTextWizardAtomicState, AltTextWizardState } from '@/state-machine.ts';

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
  return new Map<AltTextWizardAtomicState, QuestionStepContent>([
    [
      'atomic_canPlaceTextBeside',
      {
        questionId: 'atomic_canPlaceTextBeside',
        questionText: msg('Can you also place the text in or next to the image?'),
        showBack: true,
      },
    ],
    [
      'atomic_containsText',
      {
        questionId: 'atomic_containsText',
        questionText: msg('Does the image contain text?'),
        showBack: true,
      },
    ],
    [
      'atomic_containsUniqueInfo',
      {
        questionId: 'atomic_containsUniqueInfo',
        questionText: msg(
          'Does the image contain information that is not available as text on the page and is necessary to understand the content?',
        ),
        showBack: true,
      },
    ],
    [
      'atomic_informationLost',
      {
        questionId: 'atomic_informationLost',
        questionText: msg('If I remove the image, will information be lost?'),
        sectionTitle: msg('Decorative images'),
        showBack: false,
      },
    ],
    [
      'atomic_isClickable',
      {
        questionId: 'atomic_isClickable',
        questionText: msg('Is the image clickable (link, button)?'),
        showBack: true,
      },
    ],
    [
      'atomic_isInfoSimple',
      {
        questionId: 'atomic_isInfoSimple',
        questionText: msg('Is the information short and simple (2-3 lines)?'),
        showBack: true,
      },
    ],
    [
      'atomic_isLogo',
      {
        questionId: 'atomic_isLogo',
        questionText: msg('Is it a logo?'),
        showBack: true,
      },
    ],
    [
      'atomic_isLogoClickable',
      {
        questionId: 'atomic_isLogoClickable',
        questionText: msg('Is the image a logo?'),
        sectionTitle: msg('Logo'),
        showBack: true,
      },
    ],
  ]);
}
