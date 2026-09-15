import { ClippyDocument } from './index';

declare global {
  var __clippyDocument: ClippyDocument | undefined;
}

export const getClippyDocument = (): ClippyDocument => (globalThis.__clippyDocument ??= new ClippyDocument());
