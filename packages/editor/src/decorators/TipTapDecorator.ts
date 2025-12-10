import type { Editor } from '@tiptap/core';
import type { ReactiveControllerHost } from 'lit';
import { TipTapController } from '@/controllers/TipTapController.ts';

const controllerInstances = new WeakMap<ReactiveControllerHost, TipTapController>();

export function editor() {
  return (target: ReactiveControllerHost, propertyKey: PropertyKey): void => {
    Object.defineProperty(target, propertyKey, {
      configurable: true,
      enumerable: true,
      get(this: ReactiveControllerHost & HTMLElement): Editor | undefined {
        let controller = controllerInstances.get(this);
        if (!controller) {
          controller = new TipTapController(this);
          controllerInstances.set(this, controller);
        }
        return controller.editor;
      },
    });
  };
}
