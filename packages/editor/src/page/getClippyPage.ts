import { ClippyPage } from './index';

declare global {
  var __clippyPage: ClippyPage | undefined;
}

export const getClippyPage = (): ClippyPage => (globalThis.__clippyPage ??= new ClippyPage());
