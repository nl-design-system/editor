// Public `/correctors` subpath entry point. The corrections themselves live with
// the rules they fix, in `../components/<component>/corrector.ts`; this barrel
// keeps them reachable as one flat import for hosts that call a fix directly.
export * from '../components/definition-list/corrector';
export * from '../components/heading/corrector';
export * from '../components/image/corrector';
export * from '../components/link/corrector';
export * from '../components/paragraph/corrector';
export * from '../components/rich-text-content/corrector';
export * from '../components/table/corrector';
