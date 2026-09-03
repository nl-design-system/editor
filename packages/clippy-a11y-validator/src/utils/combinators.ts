export const not =
  <A extends unknown[]>(predicate: (...args: A) => boolean) =>
  (...args: A): boolean =>
    !predicate(...args);

export const and =
  <A extends unknown[]>(...predicates: readonly ((...args: A) => boolean)[]) =>
  (...args: A): boolean =>
    predicates.every((predicate) => predicate(...args));

export const or =
  <A extends unknown[]>(...predicates: readonly ((...args: A) => boolean)[]) =>
  (...args: A): boolean =>
    predicates.some((predicate) => predicate(...args));
