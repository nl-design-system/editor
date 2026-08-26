import type { CorrectValidationFunction } from '@/types';
import { selectElement, unwrapElement } from '@/dom';

/** Node types that make up a table's structure — removing one would break the table. */
const STRUCTURAL_NODE_TYPES = new Set(['tableCaption', 'tableCell', 'tableHeader']);

// Remove an empty node — but select table cells/captions instead of removing
// them, since deleting a cell would break the table structure.
export const correctEmptyNode =
  (node: Element, nodeType: string): CorrectValidationFunction =>
  () => {
    if (STRUCTURAL_NODE_TYPES.has(nodeType)) {
      selectElement(node);
    } else {
      node.remove();
    }
  };

export const correctEmptyMark =
  (node: Element): CorrectValidationFunction =>
  () => {
    node.remove();
  };

// Unwrap the <u>, keeping its text.
export const correctUnderlinedMark =
  (node: Element): CorrectValidationFunction =>
  () => {
    unwrapElement(node);
  };
