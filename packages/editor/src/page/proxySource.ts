import type { ClippyPage } from './index';
import type { RegisteredSource } from './types';

/** `render` keeps the proxy markup in `container` current; reusing its elements keeps violations stable across passes. */
export type ProxySourceRegistration = {
  anchor: Element;
  events?: readonly string[];
  label: string;
  render: (container: HTMLElement) => void;
};

export type RegisteredProxySource = RegisteredSource & {
  update: () => void;
};

export const registerProxySource = (
  page: ClippyPage,
  { anchor, events = [], label, render }: ProxySourceRegistration,
): RegisteredProxySource => {
  const container = anchor.ownerDocument.createElement('div');
  const update = () => render(container);
  update();
  events.forEach((event) => anchor.addEventListener(event, update));
  const { id, unregister } = page.register({ anchor, fragment: container, label });

  return {
    id,
    unregister: () => {
      events.forEach((event) => anchor.removeEventListener(event, update));
      unregister();
    },
    update,
  };
};
