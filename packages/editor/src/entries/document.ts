export { ClippyDocument } from '../document/index';
export type {
  Action,
  ActionHandler,
  ClippyDocumentOptions,
  DocumentViolation,
  RegisteredSource,
  SourceRegistration,
  ViolationsListener,
} from '../document/types';
export { getClippyDocument } from '../document/getClippyDocument';
export { registerHeadingSource } from '../document/headingSource';
export type { HeadingLevel, HeadingSourceRegistration } from '../document/headingSource';
export { registerProxySource } from '../document/proxySource';
export type { ProxySourceRegistration, RegisteredProxySource } from '../document/proxySource';
