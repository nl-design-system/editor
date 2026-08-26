/** Link texts that describe the act of clicking rather than the destination. */
const GENERIC_LINK_TEXTS = new Set(['lees meer', 'klik hier']);

/** A link whose text gives no clue where it leads when read out of context. */
export const hasGenericLinkText = (element: Element): boolean => {
  if (element.tagName !== 'A') return false;

  return GENERIC_LINK_TEXTS.has((element.textContent ?? '').trim().toLowerCase());
};
