import type { ClippyDocument } from '@nl-design-system-community/editor/document';
import type { Panel } from '@nl-design-system-community/editor/panel';
import { setDarkColorScheme, watchHostColorScheme } from '@nl-design-system-community/editor/color-scheme';
import '@nl-design-system-community/editor/panel';

export type ReportPanel = {
  panel: Panel;
  unwatchColorScheme: () => void;
};

export const createReportPanel = (clippyDocument: ClippyDocument): ReportPanel => {
  const panel = document.createElement('clippy-panel');
  panel.classList.add('ma-theme', 'clippy-theme', 'utrecht-theme');
  panel.clippyDocument = clippyDocument;

  return {
    panel,
    unwatchColorScheme: watchHostColorScheme(panel, (colorScheme) => setDarkColorScheme(colorScheme === 'dark', panel)),
  };
};
