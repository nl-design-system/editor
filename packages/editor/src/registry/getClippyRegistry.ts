import { ClippyRegistry } from './index';

declare global {
  var __clippyRegistry: ClippyRegistry | undefined;
}

export const getClippyRegistry = (): ClippyRegistry => (globalThis.__clippyRegistry ??= new ClippyRegistry());
