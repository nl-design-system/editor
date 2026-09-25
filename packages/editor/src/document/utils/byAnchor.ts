import type { SourceRegistration } from '../types';

export const byAnchor = ({ anchor: a }: SourceRegistration, { anchor: b }: SourceRegistration): number => {
  if (a === b) return 0;

  return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_PRECEDING ? 1 : -1;
};
