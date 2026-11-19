import { inlineViolation, violation } from '@test/violation';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import type { Violation } from '@/types/validation';
import { CustomEvents, type OpenValidationGroupDetail } from '@/events';
import { VALIDATION_HOVER_HIGHLIGHT_NAMES } from '@/utils/highlights';
import './index';
import type { ValidationButton } from './index';

describe('<clippy-validation-button>', () => {
  let validationButton: ValidationButton;

  const button = () => validationButton.shadowRoot!.querySelector('button');

  const violationWith = (severity: Violation['severity']) => violation({ range: document.createRange(), severity });

  beforeEach(async () => {
    document.documentElement.lang = 'nl';
    validationButton = document.createElement('clippy-validation-button');
    document.body.replaceChildren(validationButton);
    await validationButton.updateComplete;
  });

  afterEach(() => {
    document.body.replaceChildren();
  });

  it('renders nothing without validations', () => {
    expect(button()).toBeNull();
  });

  it('is an icon-only button named after the first validation, marked with its severity', async () => {
    validationButton.violations = [violationWith('warning'), violationWith('info')];
    await validationButton.updateComplete;

    expect(button()).toHaveAccessibleName("Validatiemelding 'Deze alinea is leeg' openen");
    expect(button()!.querySelector('svg')).not.toBeNull();
    expect(button()).toHaveClass('clippy-validation-button--warning');
  });

  it('opens its validations for its hub when clicked', async () => {
    const violations = [violationWith('error'), violationWith('warning')];
    validationButton.violations = violations;
    validationButton.identifier = 'editor';
    await validationButton.updateComplete;
    const opened: OpenValidationGroupDetail[] = [];
    const record = (event: Event) => opened.push((event as CustomEvent<OpenValidationGroupDetail>).detail);
    globalThis.addEventListener(CustomEvents.OPEN_VALIDATION_GROUP, record);

    button()!.click();
    globalThis.removeEventListener(CustomEvents.OPEN_VALIDATION_GROUP, record);

    expect(opened).toEqual([{ identifier: 'editor', ranges: violations.map(({ range }) => range) }]);
  });

  describe('highlights', () => {
    const highlighted = (severity: Violation['severity']) => {
      const highlight = CSS.highlights.get(VALIDATION_HOVER_HIGHLIGHT_NAMES[severity]);
      return highlight ? [...highlight] : [];
    };

    const showValidationOn = async (element: Element, overrides: Partial<Violation> = {}) => {
      const range = document.createRange();
      range.selectNodeContents(element);
      validationButton.violations = [inlineViolation({ element: element as HTMLElement, range, ...overrides })];
      await validationButton.updateComplete;
      return range;
    };

    let link: HTMLAnchorElement;

    beforeEach(() => {
      const paragraph = document.createElement('p');
      paragraph.innerHTML = 'Ga naar <a href="#">lees meer</a>.';
      document.body.prepend(paragraph);
      link = paragraph.querySelector('a')!;
    });

    it('highlights the text of an inline validation while it is hovered', async () => {
      const range = await showValidationOn(link, { severity: 'warning' });

      await page.elementLocator(button()!).hover();
      expect(highlighted('warning')).toEqual([range]);

      await page.elementLocator(button()!).unhover();
      expect(highlighted('warning')).toEqual([]);
    });

    it('highlights the text of an inline validation while it has focus', async () => {
      const range = await showValidationOn(link, { severity: 'error' });

      button()!.focus();
      expect(highlighted('error')).toEqual([range]);

      button()!.blur();
      expect(highlighted('error')).toEqual([]);
    });

    it('does not highlight a block validation, which the gutter already marks', async () => {
      await showValidationOn(link, { display: 'block', severity: 'warning' });

      button()!.focus();

      expect(highlighted('warning')).toEqual([]);
    });
  });
});
