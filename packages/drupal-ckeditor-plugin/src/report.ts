import { type ClippyDocument, createReportPanel } from '@nl-design-system-community/ckeditor-plugin';

export const attachReport = (form: HTMLFormElement, clippyDocument: ClippyDocument): (() => void) => {
  const report = form.ownerDocument.createElement('aside');
  report.className = 'clippy-drupal-report';
  report.setAttribute('aria-label', 'Accessibility report');

  const { panel, unwatchColorScheme } = createReportPanel(clippyDocument);
  report.append(panel);

  const layout = form.parentElement;
  layout?.classList.add('clippy-drupal-report-layout');
  form.classList.add('clippy-drupal-report-form');
  form.after(report);

  return () => {
    unwatchColorScheme();
    report.remove();
    form.classList.remove('clippy-drupal-report-form');
    layout?.classList.remove('clippy-drupal-report-layout');
  };
};
