import type { Editor } from '@tiptap/core';
import type { Level } from '@tiptap/extension-heading';
import type { ImageUpload } from '@/types/image.ts';
import type { CorrectValidationFunction } from '@/types/validation.ts';
import { contentValidations, documentValidations } from '@/constants';
import { CustomEvents } from '@/events';
import {
  buildListItemsFromParagraph,
  collectConsecutiveListParagraphs,
  findFirstCellPositionInTable,
} from './helpers.ts';

// ── Shared HTML-content helper ────────────────────────────────────────────────

/**
 * Wraps an HTML-producing function into a `CorrectValidationFunction`.
 * The producer returns the complete new editor HTML, or `null` to skip.
 * `focus` and `setContent` are applied exactly once at this level so
 * individual correctors do not need to call them directly.
 */
const withHtmlContent =
  (produce: (editor: Editor) => string | null): CorrectValidationFunction =>
  (editor) => {
    try {
      const html = produce(editor);
      if (html !== null) {
        editor.chain().focus().setContent(html).run();
      }
    } catch {
      /* noop */
    }
  };

// ── Document correctors ───────────────────────────────────────────────────────

/**
 * Corrects a heading's level to `targetLevel` using HTML manipulation.
 * A temporary data attribute locates the element in the serialised HTML
 * because the tag name cannot be changed in-place.
 */
export const correctHeadingLevel =
  (element: Element, targetLevel: Level): CorrectValidationFunction =>
  withHtmlContent((editor) => {
    if (!editor.view.dom.contains(element)) return null;

    const marker = 'data-clippy-retype';
    element.setAttribute(marker, '');
    const markedHtml = editor.view.dom.innerHTML;
    element.removeAttribute(marker);

    const wrapper = document.createElement('div');
    wrapper.innerHTML = markedHtml;
    const target = wrapper.querySelector(`[${marker}]`);
    if (!target) return null;

    const replacement = document.createElement(`h${targetLevel}`);
    replacement.innerHTML = target.innerHTML;
    for (const { name, value } of Array.from(target.attributes)) {
      if (name !== marker) replacement.setAttribute(name, value);
    }
    target.replaceWith(replacement);
    return wrapper.innerHTML;
  });

/**
 * Converts a sequence of list-like paragraphs starting at `applyPos`
 * into a proper ordered or unordered list node.
 */
export const correctConvertToList =
  (applyPos: number, isOrdered: boolean): CorrectValidationFunction =>
  (editor: Editor) => {
    const { doc, schema } = editor.state;

    const listType = isOrdered ? schema.nodes['orderedList'] : schema.nodes['bulletList'];
    const listItemType = schema.nodes['listItem'];
    const paragraphType = schema.nodes['paragraph'];

    if (!listType || !listItemType || !paragraphType) return;

    const { endPos, paragraphs } = collectConsecutiveListParagraphs(doc, applyPos, isOrdered);

    if (paragraphs.length === 0) return;

    const listItems = paragraphs.flatMap((paragraph) =>
      buildListItemsFromParagraph(paragraph, isOrdered, listItemType, paragraphType, schema),
    );

    const { tr } = editor.state;
    tr.replaceWith(applyPos, endPos, listType.create(null, listItems));
    editor.view.dispatch(tr);
  };

/**
 * Demotes a duplicate <h1> to <h2>.
 */
export const correctDuplicateHeadingOne =
  (pos: number): CorrectValidationFunction =>
  (editor: Editor) => {
    editor.chain().focus().setNodeSelection(pos).setHeading({ level: 2 }).run();
  };

/**
 * Promotes the first block in the document to <h1> when the document
 * is expected to start with a top-level heading.
 */
export const correctMissingTopLevelHeading = (): CorrectValidationFunction => (editor: Editor) => {
  editor.chain().focus().setNodeSelection(0).setHeading({ level: 1 }).run();
};

/**
 * Converts a fully-bold short paragraph into the appropriate heading level,
 * stripping the bold and italic marks from the converted heading.
 * The target level is derived at apply-time by inspecting the nearest
 * preceding heading in the document.
 */
export const correctHeadingResemblingParagraph =
  (pos: number, nodeSize: number): CorrectValidationFunction =>
  (editor: Editor) => {
    let precedingHeadingLevel = 1;

    editor.state.doc.nodesBetween(0, pos, (node) => {
      if (node.type.name === 'heading') {
        precedingHeadingLevel = node.attrs['level'] as number;
      }
      return true;
    });

    const targetLevel = Math.min(precedingHeadingLevel + 1, 6) as Level;

    editor
      .chain()
      .focus()
      .setNodeSelection(pos)
      .setHeading({ level: targetLevel })
      .setTextSelection({ from: pos + 1, to: pos + nodeSize - 1 })
      .unsetMark('bold')
      .unsetMark('italic')
      .run();
  };

/**
 * Adds a header row to a table that has neither a header row nor a header column.
 */
export const correctTableMissingHeadings =
  (pos: number): CorrectValidationFunction =>
  (editor: Editor) => {
    const tableNode = editor.state.doc.nodeAt(pos);
    if (!tableNode) return;

    const cellPos = findFirstCellPositionInTable(editor, pos, tableNode);
    if (cellPos === null) return;

    editor.chain().focus().setTextSelection(cellPos).toggleHeaderRow().run();
  };

/**
 * Adds a row after the first row of a table that contains only a single row.
 */
export const correctTableMissingRows =
  (pos: number): CorrectValidationFunction =>
  (editor: Editor) => {
    const tableNode = editor.state.doc.nodeAt(pos);
    if (!tableNode) return;

    const cellPos = findFirstCellPositionInTable(editor, pos, tableNode);
    if (cellPos === null) return;

    editor.chain().focus().setTextSelection(cellPos).addRowAfter().run();
  };

// ── Content correctors ────────────────────────────────────────────────────────

/**
 * Selects the image node and opens the image dialog so the user can supply
 * alt text. The existing src and (empty) alt are pre-filled in the dialog.
 */
export const correctImageMissingAltText =
  (pos: number, altText: string, src: string): CorrectValidationFunction =>
  (editor: Editor) => {
    editor.chain().focus().setNodeSelection(pos).run();

    const imageUpload: ImageUpload = { name: altText, type: 'image/*', url: src };

    globalThis.dispatchEvent(
      new CustomEvent(CustomEvents.OPEN_IMAGE_DIALOG, {
        detail: { files: [imageUpload], position: pos, replace: true },
      }),
    );
  };

/**
 * Removes an empty node from the document.
 * For table cells, the cursor is placed inside instead because deleting a cell
 * would break the table structure.
 */
export const correctEmptyNode =
  (pos: number, nodeType: string): CorrectValidationFunction =>
  (editor: Editor) => {
    if (nodeType === 'tableCell' || nodeType === 'tableHeader') {
      editor
        .chain()
        .focus()
        .setTextSelection(pos + 1)
        .run();
    } else {
      editor.chain().focus().setNodeSelection(pos).deleteSelection().run();
    }
  };

/**
 * Removes an empty inline mark from the document.
 * The element is temporarily removed from the live DOM to snapshot the new
 * HTML, then restored before `setContent` commits the change.
 */
export const correctEmptyMark =
  (element: Element): CorrectValidationFunction =>
  withHtmlContent((editor) => {
    if (!editor.view.dom.contains(element)) return null;

    const parent = element.parentElement;
    const nextSibling = element.nextSibling;
    element.remove();
    const html = editor.view.dom.innerHTML;
    parent?.insertBefore(element, nextSibling ?? null);
    return html;
  });

/**
 * Selects the generic link text so the user can replace it with something
 * more descriptive.
 */
export const correctGenericLinkText =
  (pos: number, nodeSize: number): CorrectValidationFunction =>
  (editor: Editor) => {
    editor
      .chain()
      .focus()
      .setTextSelection({ from: pos, to: pos + nodeSize })
      .run();
  };

/**
 * Removes the underline mark from the text node.
 */
export const correctUnderlinedMark =
  (pos: number, nodeSize: number): CorrectValidationFunction =>
  (editor: Editor) => {
    editor
      .chain()
      .focus()
      .setTextSelection({ from: pos, to: pos + nodeSize })
      .unsetMark('underline')
      .run();
  };

/**
 * Deletes an empty heading node.
 */
export const correctEmptyHeading =
  (pos: number): CorrectValidationFunction =>
  (editor: Editor) => {
    editor.chain().focus().setNodeSelection(pos).deleteSelection().run();
  };

/**
 * Removes bold and italic marks from a heading's content.
 * A Range selects the heading's contents, extracts the plain text via
 * `toString()`, then replaces everything inside via `deleteContents()` +
 * `insertNode()`. The live DOM is restored after snapshotting so `setContent`
 * can commit the change via the history plugin.
 */
export const correctHeadingWithFormatting =
  (element: Element): CorrectValidationFunction =>
  withHtmlContent((editor) => {
    if (!editor.view.dom.contains(element)) return null;

    const originalInnerHtml = element.innerHTML;

    const range = document.createRange();
    range.selectNodeContents(element);
    const plainText = range.toString();
    range.deleteContents();
    range.insertNode(document.createTextNode(plainText));

    const html = editor.view.dom.innerHTML;
    element.innerHTML = originalInnerHtml;
    return html;
  });

/**
 * Inserts a placeholder definition term at the start of a definition list
 * that is missing one.
 */
export const correctDefinitionListMissingTerm =
  (pos: number): CorrectValidationFunction =>
  (editor: Editor) => {
    const { schema } = editor.state;
    const termType = schema.nodes['definitionTerm'];
    if (!termType) return;

    const term = termType.create(null, schema.text('Term'));
    const { tr } = editor.state;
    tr.insert(pos + 1, term);
    editor.view.dispatch(tr);
  };

/**
 * Inserts a placeholder <dd> immediately after a <dt> that has no description.
 * A <dd> is temporarily inserted into the live DOM to snapshot the new HTML,
 * then removed before `setContent` commits the change.
 */
export const correctDefinitionTermMissingDescription =
  (element: Element): CorrectValidationFunction =>
  withHtmlContent((editor) => {
    if (!editor.view.dom.contains(element)) return null;

    const dd = document.createElement('dd');
    dd.textContent = 'Beschrijving';
    element.insertAdjacentElement('afterend', dd);
    const html = editor.view.dom.innerHTML;
    dd.remove();
    return html;
  });

// ── Corrector maps ────────────────────────────────────────────────────────────

export const documentCorrectorMap = {
  [documentValidations.DOCUMENT_MUST_HAVE_CORRECT_HEADING_ORDER]: correctHeadingLevel,
  [documentValidations.DOCUMENT_MUST_HAVE_SEMANTIC_LISTS]: correctConvertToList,
  [documentValidations.DOCUMENT_MUST_HAVE_SINGLE_HEADING_ONE]: correctDuplicateHeadingOne,
  [documentValidations.DOCUMENT_MUST_HAVE_TABLE_WITH_HEADINGS]: correctTableMissingHeadings,
  [documentValidations.DOCUMENT_MUST_HAVE_TABLE_WITH_MULTIPLE_ROWS]: correctTableMissingRows,
  [documentValidations.DOCUMENT_MUST_HAVE_TOP_LEVEL_HEADING_ONE]: correctMissingTopLevelHeading,
  [documentValidations.DOCUMENT_SHOULD_NOT_HAVE_HEADING_RESEMBLING_PARAGRAPHS]: correctHeadingResemblingParagraph,
} as const;

export const contentCorrectorMap = {
  [contentValidations.DEFINITION_DESCRIPTION_MUST_FOLLOW_TERM]: correctDefinitionTermMissingDescription,
  [contentValidations.DESCRIPTION_LIST_MUST_CONTAIN_TERM]: correctDefinitionListMissingTerm,
  [contentValidations.HEADING_MUST_NOT_BE_EMPTY]: correctEmptyHeading,
  [contentValidations.HEADING_SHOULD_NOT_CONTAIN_BOLD_OR_ITALIC]: correctHeadingWithFormatting,
  [contentValidations.IMAGE_MUST_HAVE_ALT_TEXT]: correctImageMissingAltText,
  [contentValidations.LINK_SHOULD_NOT_BE_TOO_GENERIC]: correctGenericLinkText,
  [contentValidations.MARK_SHOULD_NOT_BE_EMPTY]: correctEmptyMark,
  [contentValidations.MARK_SHOULD_NOT_BE_UNDERLINED]: correctUnderlinedMark,
  [contentValidations.NODE_SHOULD_NOT_BE_EMPTY]: correctEmptyNode,
} as const;
