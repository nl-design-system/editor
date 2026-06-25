import { msg } from '@lit/localize';
import type { AltTextWizardFinalState, AltTextWizardState } from '@/state-machine.ts';

export interface FinalStepContent {
  instructions: unknown;
  title: unknown;
}

/**
 * Returns the content map for all final steps.
 * Must be called inside `render()` so `msg()` resolves in the correct `@localized()` context.
 */
export function getFinalContent(): ReadonlyMap<AltTextWizardState, FinalStepContent> {
  return new Map<AltTextWizardFinalState, FinalStepContent>([
    [
      'final_ambient',
      {
        instructions: msg(
          'This image sets the mood but does not contain unique information. Set the alt attribute to empty (alt="") or use a brief description that conveys the mood.',
        ),
        title: msg('Ambient image'),
      },
    ],
    [
      'final_clickableLogo',
      {
        instructions: msg(
          'Use the company or organization name as alt text. For example: alt="Organization Name - go to homepage".',
        ),
        title: msg('Clickable logo'),
      },
    ],
    [
      'final_complexInformative',
      {
        instructions: msg(
          'Provide a short alt text as summary. Also provide a detailed description in the surrounding text or via a link to a full description.',
        ),
        title: msg('Complex informative image'),
      },
    ],
    [
      'final_decorative',
      {
        instructions: msg(
          'This image is decorative. Set the alt attribute to empty (alt=""). This way, screen readers will skip the image.',
        ),
        title: msg('Decorative image'),
      },
    ],
    [
      'final_functionalWithSupplementaryText',
      {
        instructions: msg(
          'The text next to the image already describes its function. Set the alt attribute to empty (alt="") to avoid repetition.',
        ),
        title: msg('Functional image with supplementary text'),
      },
    ],
    [
      'final_functionalWithText',
      {
        instructions: msg(
          'The image contains text that is not available elsewhere. Use the text from the image as alt text.',
        ),
        title: msg('Functional image with text'),
      },
    ],
    [
      'final_functionalWithoutText',
      {
        instructions: msg(
          'Describe the function of the image, not what it looks like. For example: alt="Search" for a magnifying glass icon used as a search button.',
        ),
        title: msg('Functional image without text'),
      },
    ],
    [
      'final_logo',
      {
        instructions: msg('Use the company or organization name as alt text. For example: alt="Organization Name".'),
        title: msg('Logo'),
      },
    ],
    [
      'final_simpleInformative',
      {
        instructions: msg(
          'Describe the essential information from the image in the alt text. Keep it short: 1 to 2 sentences.',
        ),
        title: msg('Simple informative image'),
      },
    ],
  ]);
}
