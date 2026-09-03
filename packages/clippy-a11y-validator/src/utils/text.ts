const EMPTY_STR_REGEX = /^\s*$/;

export const isEmptyOrWhitespace = (text: string): boolean => EMPTY_STR_REGEX.test(text);
