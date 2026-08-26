import type { Locale } from './types';

/**
 * Join numbers into a localised "either/or" list — `[2, 3, 4]` becomes
 * `"2, 3, or 4"` in English and `"2, 3 of 4"` in Dutch.
 */
export const orList = (values: number[], locale: Locale): string =>
  new Intl.ListFormat(locale, { style: 'long', type: 'disjunction' }).format(values.map(String));
