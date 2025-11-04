export const isMacOS = () => {
  if (typeof navigator === 'undefined') return false;
  return /Mac/.test(navigator.userAgent);
};
