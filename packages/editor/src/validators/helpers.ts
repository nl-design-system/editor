export const MIN_GUTTER_ITEM_HEIGHT = 8;

export const isKeyOf =
  <T, Keys extends PropertyKey>(obj: { [K in Keys]: T }) =>
  (arg: PropertyKey): arg is Keys =>
    Object.hasOwn(obj, arg);

/**
 * - include = ['*'] should include the whole map
 * - include = ['foo'] should only include foo
 * - exclude = ['foo'] includes everything except foo
 */
export const getEntries = <Keys extends string, Value>(
  input: { [K in Keys]: Value },
  include: (Keys | '*')[] = ['*'],
  exclude: (Keys | '*')[] = [],
): Partial<{ [K in Keys]: Value }> => {
  let map: Partial<{ [K in Keys]: Value }> = {};

  if (include.includes('*')) {
    map = { ...input };
  }

  include
    .filter((x): x is Keys => x !== '*')
    .forEach((key) => {
      if (Object.hasOwn(input, key)) {
        map[key] = input[key];
      }
    });

  exclude
    .filter((x): x is Keys => x !== '*')
    .forEach((key) => {
      if (Object.hasOwn(map, key)) {
        delete map[key];
      }
    });

  return map;
};
