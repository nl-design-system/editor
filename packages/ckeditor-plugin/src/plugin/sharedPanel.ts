import type { ClippyDocument } from '@nl-design-system-community/editor/document';
import type { Panel } from '@nl-design-system-community/editor/panel';
import { setDarkColorScheme, watchHostColorScheme } from '@nl-design-system-community/editor/color-scheme';
import '@nl-design-system-community/editor/panel';

export type SharedPanel = {
  close: () => void;
  isShowing: () => boolean;
  onChange: (listener: () => void) => () => void;
  release: () => void;
  toggle: () => void;
};

type Shared = {
  listeners: Set<() => void>;
  panel: Panel;
  sources: Set<string>;
  unwatchColorScheme: () => void;
};

let shared: Shared | null = null;

const createShared = (clippyDocument: ClippyDocument): Shared => {
  const panel = document.createElement('clippy-panel');
  panel.classList.add('clippy-ckeditor-panel', 'ma-theme', 'clippy-theme', 'utrecht-theme');
  panel.setAttribute('role', 'region');
  panel.setAttribute('aria-label', 'Clippy');
  panel.clippyDocument = clippyDocument;
  panel.hidden = true;
  document.body.append(panel);

  return {
    listeners: new Set(),
    panel,
    sources: new Set(),
    unwatchColorScheme: watchHostColorScheme(panel, (colorScheme) => setDarkColorScheme(colorScheme === 'dark', panel)),
  };
};

export const attachSharedPanel = (clippyDocument: ClippyDocument, source: string): SharedPanel => {
  shared ??= createShared(clippyDocument);
  const current = shared;
  current.sources.add(source);

  const notify = () => current.listeners.forEach((listener) => listener());
  const isShowing = () => !current.panel.hidden && current.panel.source === source;
  const close = () => {
    if (!isShowing()) return;
    current.panel.hidden = true;
    notify();
  };

  return {
    close,
    isShowing,
    onChange: (listener) => {
      current.listeners.add(listener);
      return () => current.listeners.delete(listener);
    },
    release: () => {
      close();
      current.sources.delete(source);
      if (current.sources.size > 0) return;

      current.unwatchColorScheme();
      current.panel.remove();
      if (shared === current) shared = null;
    },
    toggle: () => {
      if (isShowing()) {
        close();
        return;
      }
      current.panel.source = source;
      current.panel.hidden = false;
      notify();
    },
  };
};
