import type { ContentValidator, TreeValidator, ValidationContext } from '@/types';
import { definitionListContentValidators } from './definition-list';
import { headingContentValidators, headingTreeValidators } from './heading';
import { imageContentValidators } from './image';
import { linkContentValidators } from './link';
import { paragraphContentValidators } from './paragraph';
import { richTextContentValidators } from './rich-text-content';
import { tableContentValidators } from './table';

// One folder per NL Design System component (https://nldesignsystem.nl/componenten),
// each holding the component's `rules` (pure detection), its `corrector` (deferred
// DOM fixes) and an `index` binding the two into validators. This module is the
// only place that knows about all of them.

/**
 * Build every per-element validator for one run, keyed by rule id and grouped by
 * the NL Design System component it applies to. Run against each element during
 * the DOM walk. Rules that word their own `solution` close over `context`'s
 * translator, so detection itself only ever takes the DOM it inspects.
 */
export const contentValidators = (context: ValidationContext): Record<string, ContentValidator> => ({
  ...headingContentValidators(context),
  ...paragraphContentValidators(context),
  ...linkContentValidators(),
  ...imageContentValidators(context),
  ...tableContentValidators(),
  ...definitionListContentValidators(),
  ...richTextContentValidators(context),
});

/**
 * Build every whole-tree validator for one run, keyed by rule id. These inspect
 * the content as a whole rather than a single element (currently only
 * heading-order rules).
 */
export const treeValidators = (context: ValidationContext): Record<string, TreeValidator> => ({
  ...headingTreeValidators(context),
});
