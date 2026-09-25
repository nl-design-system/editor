import type { PageViolation } from '../types';

const samePayload = (a: PageViolation['payload'] = {}, b: PageViolation['payload'] = {}): boolean =>
  Object.keys(a).length === Object.keys(b).length && Object.entries(a).every(([key, value]) => b[key] === value);

const sameViolation = (a: PageViolation, b: PageViolation): boolean =>
  a.element === b.element &&
  a.rule === b.rule &&
  a.source === b.source &&
  a.severity === b.severity &&
  samePayload(a.payload, b.payload);

export const hasChanges = (previous: readonly PageViolation[], next: readonly PageViolation[]): boolean =>
  previous.length !== next.length || previous.some((violation, index) => !sameViolation(violation, next[index]));
