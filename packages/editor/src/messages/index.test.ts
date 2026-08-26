import { render } from 'lit';
import { describe, expect, it } from 'vitest';
import { validations } from '@/constants';
import { renderSolution, validationMessages } from './index';

/** Renders a solution into a detached host and returns its text, mirroring the components. */
const renderedText = (solution: string | undefined): string => {
  const host = document.createElement('div');
  render(renderSolution(solution), host);
  return host.textContent?.trim() ?? '';
};

const allKeys = Object.values(validations);

describe('validationMessages', () => {
  it('provides a heading for every rule key', () => {
    const messages = validationMessages('en');
    for (const key of allKeys) {
      expect(messages[key].heading.length, key).toBeGreaterThan(0);
    }
  });

  it('reads its wording from the validator catalogue, in the requested language', () => {
    expect(validationMessages('en')[validations.HEADING_MUST_NOT_BE_EMPTY].heading).toBe('Heading must not be empty');
    expect(validationMessages('nl')[validations.HEADING_MUST_NOT_BE_EMPTY].heading).toBe('Koptekst mag niet leeg zijn');
  });

  it('carries the guidance link and correct-button label from the catalogue', () => {
    const messages = validationMessages('nl');
    expect(messages[validations.HEADING_MUST_NOT_BE_EMPTY].href).toContain('nldesignsystem.nl');
    expect(messages[validations.IMAGE_MUST_HAVE_ALT_TEXT].correctLabel).toBe('Bewerken');
  });

  it('follows the document language when none is given', () => {
    document.documentElement.lang = 'nl';
    expect(validationMessages()[validations.HEADING_MUST_NOT_BE_EMPTY].heading).toBe('Koptekst mag niet leeg zijn');
    document.documentElement.lang = 'en';
  });

  it('shows the NL Design System prose in Dutch and our own wording in English', () => {
    expect(validationMessages('nl')[validations.PARAGRAPH_SHOULD_NOT_BE_ENTIRELY_BOLD].heading).toBe(
      'De hele alinea is dikgedrukt.',
    );
    expect(validationMessages('en')[validations.PARAGRAPH_SHOULD_NOT_BE_ENTIRELY_BOLD].heading).toBe(
      'Avoid making an entire paragraph bold',
    );
  });
});

describe('renderSolution', () => {
  it('renders markdown emphasis coming from the validator', () => {
    expect(renderedText('Remove the empty **paragraph** or add text.')).toBe('Remove the empty paragraph or add text.');
  });

  it('renders nothing when a rule has no solution', () => {
    expect(renderedText(undefined)).toBe('');
  });
});
