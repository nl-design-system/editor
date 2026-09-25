export { ClippyPage } from '../page/index';
export type {
  ClippyPageOptions,
  PageViolation,
  RegisteredSource,
  SourceRegistration,
  ViolationsListener,
} from '../page/types';
export { getClippyPage } from '../page/getClippyPage';
export { registerHeadingSource } from '../page/headingSource';
export type { HeadingLevel, HeadingSourceRegistration } from '../page/headingSource';
export { registerProxySource } from '../page/proxySource';
export type { ProxySourceRegistration, RegisteredProxySource } from '../page/proxySource';
