import { ClippyDocument } from '@nl-design-system-community/ckeditor-plugin';
import { beforeEach, describe, expect, it } from 'vitest';
import { attachReport } from './report.ts';

const createNodeForm = () => {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = '<form class="node-form"></form>';
  document.body.append(wrapper);
  return wrapper.querySelector('form')!;
};

let clippyDocument: ClippyDocument;

beforeEach(() => {
  document.body.replaceChildren();
  clippyDocument = new ClippyDocument();
});

describe('attachReport', () => {
  it('places a report on the whole document beside the form', () => {
    const form = createNodeForm();
    attachReport(form, clippyDocument);

    const report = form.nextElementSibling;
    const panel = report?.querySelector('clippy-panel');
    expect(report?.getAttribute('aria-label')).toBe('Accessibility report');
    expect(panel?.clippyDocument).toBe(clippyDocument);
    expect(panel?.source).toBeNull();
  });

  it('removes the report when detached', () => {
    const form = createNodeForm();
    const detach = attachReport(form, clippyDocument);

    detach();

    expect(form.nextElementSibling).toBeNull();
    expect(form.parentElement?.classList.contains('clippy-drupal-report-layout')).toBe(false);
  });
});
