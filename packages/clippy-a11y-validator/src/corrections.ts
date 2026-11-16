import type { ViolationCorrection } from './types/validation.ts';

/** The correction a host offers first. A rule lists its corrections primary first, then any alternatives. */
export const getPrimaryCorrection = (
  corrections: readonly ViolationCorrection[] | undefined,
): ViolationCorrection | undefined => corrections?.[0];

/** Every correction after the primary one, in the order the rule lists them. */
export const getAlternativeCorrections = (
  corrections: readonly ViolationCorrection[] | undefined,
): ViolationCorrection[] => corrections?.slice(1) ?? [];
