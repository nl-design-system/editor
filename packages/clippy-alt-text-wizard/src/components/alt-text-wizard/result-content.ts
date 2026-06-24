import { msg } from '@lit/localize';
import type { AltTextWizardResultState, AltTextWizardState } from '@/state-machine.ts';

export interface ResultStepContent {
  instructions: unknown;
  title: unknown;
}

/**
 * Returns the content map for all result steps.
 * Must be called inside `render()` so `msg()` resolves in the correct `@localized()` context.
 */
export function getResultContent(): ReadonlyMap<AltTextWizardState, ResultStepContent> {
  return new Map<AltTextWizardResultState, ResultStepContent>([
    [
      'decorativeResult',
      {
        instructions: msg(
          'This image is decorative. Set the alt attribute to empty (alt=""). This way, screen readers will skip the image.',
          { id: 'result-decorative-instructions' },
        ),
        title: msg('Decorative image', { id: 'result-decorative-title' }),
      },
    ],
    [
      'clickableLogoResult',
      {
        instructions: msg(
          'Use the company or organization name as alt text. For example: alt="Organization Name - go to homepage".',
          { id: 'result-clickable-logo-instructions' },
        ),
        title: msg('Clickable logo', { id: 'result-clickable-logo-title' }),
      },
    ],
    [
      'functionalWithoutTextResult',
      {
        instructions: msg(
          'Describe the function of the image, not what it looks like. For example: alt="Search" for a magnifying glass icon used as a search button.',
          { id: 'result-functional-no-text-instructions' },
        ),
        title: msg('Functional image without text', { id: 'result-functional-no-text-title' }),
      },
    ],
    [
      'functionalWithSupplementaryTextResult',
      {
        instructions: msg(
          'The text next to the image already describes its function. Set the alt attribute to empty (alt="") to avoid repetition.',
          { id: 'result-functional-supplementary-text-instructions' },
        ),
        title: msg('Functional image with supplementary text', {
          id: 'result-functional-supplementary-text-title',
        }),
      },
    ],
    [
      'functionalWithTextResult',
      {
        instructions: msg(
          'The image contains text that is not available elsewhere. Use the text from the image as alt text.',
          { id: 'result-functional-with-text-instructions' },
        ),
        title: msg('Functional image with text', { id: 'result-functional-with-text-title' }),
      },
    ],
    [
      'logoResult',
      {
        instructions: msg('Use the company or organization name as alt text. For example: alt="Organization Name".', {
          id: 'result-logo-instructions',
        }),
        title: msg('Logo', { id: 'result-logo-title' }),
      },
    ],
    [
      'ambientResult',
      {
        instructions: msg(
          'This image sets the mood but does not contain unique information. Set the alt attribute to empty (alt="") or use a brief description that conveys the mood.',
          { id: 'result-ambient-instructions' },
        ),
        title: msg('Ambient image', { id: 'result-ambient-title' }),
      },
    ],
    [
      'simpleInformativeResult',
      {
        instructions: msg(
          'Describe the essential information from the image in the alt text. Keep it short: 1 to 2 sentences.',
          { id: 'result-simple-informative-instructions' },
        ),
        title: msg('Simple informative image', { id: 'result-simple-informative-title' }),
      },
    ],
    [
      'complexInformativeResult',
      {
        instructions: msg(
          'Provide a short alt text as summary. Also provide a detailed description in the surrounding text or via a link to a full description.',
          { id: 'result-complex-informative-instructions' },
        ),
        title: msg('Complex informative image', { id: 'result-complex-informative-title' }),
      },
    ],
  ]);
}
