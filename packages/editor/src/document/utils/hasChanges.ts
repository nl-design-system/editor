import type { DocumentViolation } from '../types';

const samePayload = (a: DocumentViolation['payload'] = {}, b: DocumentViolation['payload'] = {}): boolean =>
  Object.keys(a).length === Object.keys(b).length && Object.entries(a).every(([key, value]) => b[key] === value);

const sameViolation = (a: DocumentViolation, b: DocumentViolation): boolean =>
  a.element === b.element &&
  a.rule === b.rule &&
  a.source === b.source &&
  a.severity === b.severity &&
  samePayload(a.payload, b.payload);

export const hasChanges = (previous: readonly DocumentViolation[], next: readonly DocumentViolation[]): boolean =>
  previous.length !== next.length || previous.some((violation, index) => !sameViolation(violation, next[index]));
