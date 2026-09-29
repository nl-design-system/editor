import type { ClippyDocument } from './index';
import type { RegisteredSource, SourceRegistration } from './types';

/** `render` keeps the proxy markup in `container` current; reusing its elements keeps violations stable across passes. */
export type ProxySourceRegistration = Omit<SourceRegistration, 'fragment'> & {
  events?: readonly string[];
  render: (container: HTMLElement) => void;
};

export type RegisteredProxySource = RegisteredSource & {
  update: () => void;
};

export const registerProxySource = (
  clippyDocument: ClippyDocument,
  { anchor, correct, events = [], focus, label, render }: ProxySourceRegistration,
): RegisteredProxySource => {
  const container = anchor.ownerDocument.createElement('div');
  const update = () => render(container);
  update();
  events.forEach((event) => anchor.addEventListener(event, update));
  const { id, unregister } = clippyDocument.register({ anchor, correct, focus, fragment: container, label });

  return {
    id,
    unregister: () => {
      events.forEach((event) => anchor.removeEventListener(event, update));
      unregister();
    },
    update,
  };
};
