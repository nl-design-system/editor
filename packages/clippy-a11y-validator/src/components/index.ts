import type { ContentValidator, TreeValidator } from '@/types';
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
 * Every per-element validator, keyed by rule id and grouped by the NL Design
 * System component it applies to. Run against each element during the DOM walk.
 */
export const contentValidators: Record<string, ContentValidator> = {
  ...headingContentValidators,
  ...paragraphContentValidators,
  ...linkContentValidators,
  ...imageContentValidators,
  ...tableContentValidators,
  ...definitionListContentValidators,
  ...richTextContentValidators,
};

/**
 * Every whole-tree validator, keyed by rule id. These inspect the content as a
 * whole rather than a single element (currently only heading-order rules).
 */
export const treeValidators: Record<string, TreeValidator> = {
  ...headingTreeValidators,
};
