import {
  type ClippyDocument,
  registerHeadingSource,
  registerProxySource,
} from '@nl-design-system-community/ckeditor-plugin';

export type ClippyApi = {
  clippyDocument: ClippyDocument;
  registerHeadingSource: typeof registerHeadingSource;
  registerProxySource: typeof registerProxySource;
};

export const createClippyApi = (clippyDocument: ClippyDocument): ClippyApi => ({
  clippyDocument,
  registerHeadingSource,
  registerProxySource,
});
