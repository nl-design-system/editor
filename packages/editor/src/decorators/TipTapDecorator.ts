import type { Editor } from '@tiptap/core';
import type { ReactiveControllerHost } from 'lit';
import { TipTapController } from '@/controllers/TipTapController';

const controllerInstances = new WeakMap<ReactiveControllerHost, TipTapController>();

const controllerOf = (host: ReactiveControllerHost & HTMLElement): TipTapController => {
  let controller = controllerInstances.get(host);
  if (!controller) {
    controller = new TipTapController(host);
    controllerInstances.set(host, controller);
  }
  return controller;
};

export function editor() {
  return (target: ReactiveControllerHost, propertyKey: PropertyKey): void => {
    Object.defineProperty(target, propertyKey, {
      configurable: true,
      enumerable: true,
      get(this: ReactiveControllerHost & HTMLElement): Editor | undefined {
        return controllerOf(this).editor;
      },
      set(this: ReactiveControllerHost & HTMLElement, value: Editor | undefined) {
        controllerOf(this).editor = value;
      },
    });
  };
}
