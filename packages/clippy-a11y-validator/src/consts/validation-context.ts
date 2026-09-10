import type { ValidationContext } from '../types/validation.ts';
import { DEFAULT_TOP_HEADING_LEVEL } from './heading.ts';

/**
 * Context a validation falls back to when it is called outside {@link walk} — in a unit test,
 * or by a caller that composes conditions by hand.
 */
export const defaultValidationContext: ValidationContext = { topHeadingLevel: DEFAULT_TOP_HEADING_LEVEL };
