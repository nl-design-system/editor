import type { Editor } from '@tiptap/core';
import type { Node } from 'prosemirror-model';
import type { ImageUpload } from '@/types/image.ts';
import type { ContentValidator, ValidationResult } from '@/types/validation.ts';
import { CustomEvents } from '@/events';
import { contentValidations, validationSeverity } from '@/validators/constants.ts';
import { getNodeBoundingBox, isBold, isItalic } from '@/validators/helpers.ts';

const isEmptyOrWhitespaceString = (str: string): boolean => /^\s*$/.test(str);

const isEmpty = (node: Node): boolean => {
  if (node.type.name === 'text') {
    return !node.text || isEmptyOrWhitespaceString(node.text);
  } else if (node.content?.content) {
    return node.content?.content.every((node) => isEmpty(node));
  }
  return true;
};

const imageMustHaveAltText = (editor: Editor, node: Node, pos: number): ValidationResult | null => {
  if (node.type.name === 'image' && (!node.attrs['alt'] || isEmptyOrWhitespaceString(node.attrs['alt']))) {
    return {
      apply: (editor: Editor) => {
        // Select the image so that the replace action in the dialog targets the right node.
        editor.chain().focus().setNodeSelection(pos).run();

        const imageUpload: ImageUpload = {
          name: node.attrs['alt'] ?? '',
          type: 'image/*',
          url: node.attrs['src'] ?? '',
        };

        globalThis.dispatchEvent(
          new CustomEvent(CustomEvents.OPEN_IMAGE_DIALOG, {
            detail: { files: [imageUpload], position: pos, replace: true },
          }),
        );
      },
      boundingBox: getNodeBoundingBox(editor, pos),
      pos,
      severity: validationSeverity.INFO,
    };
  }
  return null;
};

const nodeTypesRequiringContent = new Set([
  'definitionTerm',
  'definitionDescription',
  'paragraph',
  'listItem',
  'tableHeader',
  'tableCell',
  'tableCaption',
]);

const nodeShouldNotBeEmpty = (editor: Editor, node: Node, pos: number): ValidationResult | null => {
  if (nodeTypesRequiringContent.has(node.type.name) && isEmpty(node)) {
    return {
      apply: (editor: Editor) => {
        if (node.type.name === 'tableCell' || node.type.name === 'tableHeader') {
          // Table cells cannot be deleted without breaking the table structure;
          // place the cursor inside so the user can add content.
          editor
            .chain()
            .focus()
            .setTextSelection(pos + 1)
            .run();
        } else {
          editor.chain().focus().setNodeSelection(pos).deleteSelection().run();
        }
      },
      boundingBox: getNodeBoundingBox(editor, pos),
      pos,
      severity: validationSeverity.INFO,
      tipPayload: {
        nodeType: node.type.name,
      },
    };
  }
  return null;
};

const markShouldNotBeEmpty = (editor: Editor, node: Node, pos: number): ValidationResult | null => {
  if (node.type.name === 'text' && node.marks?.length) {
    if (!node.text || isEmptyOrWhitespaceString(node.text)) {
      return {
        apply: (editor: Editor) => {
          const { doc } = editor.state;
          const resolvedPos = doc.resolve(pos);
          const targetNode = resolvedPos.nodeAfter ?? resolvedPos.node();
          if (!targetNode) return;
          const from = resolvedPos.nodeAfter ? pos : resolvedPos.before();
          const to = from + targetNode.nodeSize;
          editor.chain().focus().deleteRange({ from, to }).run();
        },
        boundingBox: getNodeBoundingBox(editor, pos),
        pos,
        severity: validationSeverity.INFO,
        tipPayload: {
          nodeType: node.marks[0].type.name,
        },
      };
    }
  }
  return null;
};

const genericLinkTexts = new Set(['lees meer', 'klik hier']);

const linkShouldNotBeTooGeneric = (editor: Editor, node: Node, pos: number): ValidationResult | null => {
  if (node.type.name === 'text' && node.marks?.filter((mark) => mark.type.name === 'link').length) {
    const text = (node.text ?? node.textContent ?? '').trim().toLowerCase();
    if (genericLinkTexts.has(text)) {
      return {
        apply: (editor: Editor) => {
          // Select the generic link text so the user can replace it with something descriptive
          editor
            .chain()
            .focus()
            .setTextSelection({ from: pos, to: pos + node.nodeSize })
            .run();
        },
        boundingBox: getNodeBoundingBox(editor, pos),
        pos,
        severity: validationSeverity.INFO,
      };
    }
  }
  return null;
};

const markShouldNotBeUnderlined = (editor: Editor, node: Node, pos: number): ValidationResult | null => {
  if (node.type.name === 'text' && node.marks?.some((mark) => mark.type.name === 'underline')) {
    return {
      apply: (editor: Editor) => {
        editor
          .chain()
          .focus()
          .setTextSelection({ from: pos, to: pos + node.nodeSize })
          .unsetMark('underline')
          .run();
      },
      boundingBox: getNodeBoundingBox(editor, pos),
      pos,
      severity: validationSeverity.INFO,
    };
  }
  return null;
};

const headingMustNotBeEmpty = (editor: Editor, node: Node, pos: number): ValidationResult | null => {
  if (node.type.name === 'heading' && isEmpty(node)) {
    return {
      apply: (editor: Editor) => {
        editor.chain().focus().setNodeSelection(pos).deleteSelection().run();
      },
      boundingBox: getNodeBoundingBox(editor, pos),
      pos,
      severity: validationSeverity.ERROR,
    };
  }
  return null;
};

const headingShouldNotContainBoldOrItalic = (editor: Editor, node: Node, pos: number): ValidationResult | null => {
  if (
    node.type.name === 'heading' &&
    node.content.content.some(
      (node) => node.type.name === 'text' && (node.marks.some(isBold) || node.marks.some(isItalic)),
    )
  ) {
    return {
      apply: (editor: Editor) => {
        editor
          .chain()
          .focus()
          .setTextSelection({ from: pos + 1, to: pos + node.nodeSize - 1 })
          .unsetMark('bold')
          .unsetMark('italic')
          .run();
      },
      boundingBox: getNodeBoundingBox(editor, pos),
      pos,
      severity: validationSeverity.INFO,
    };
  }
  return null;
};

const descriptionListMustContainTerm = (editor: Editor, node: Node, pos: number): ValidationResult | null => {
  if (node.type.name === 'definitionList') {
    const hasDefinitionTerm = node.content?.content.some((child) => child.type.name === 'definitionTerm');
    if (!hasDefinitionTerm) {
      return {
        apply: (editor: Editor) => {
          const { schema } = editor.state;
          const termType = schema.nodes['definitionTerm'];
          if (!termType) return;
          const term = termType.create(null, schema.text('Term'));
          const { tr } = editor.state;
          // Insert the new term at the beginning of the definition list
          tr.insert(pos + 1, term);
          editor.view.dispatch(tr);
        },
        boundingBox: getNodeBoundingBox(editor, pos),
        pos,
        severity: validationSeverity.ERROR,
      };
    }
  }
  return null;
};

const definitionDescriptionMustFollowTerm = (editor: Editor, node: Node, pos: number): ValidationResult | null => {
  if (node.type.name === 'definitionTerm') {
    const parent = editor.$doc.node.resolve(pos).parent;
    if (parent.type.name === 'definitionList') {
      const children = parent.content.content;
      const currentIndex = children.findIndex((child) => {
        return child.type.name === 'definitionTerm';
      });

      const nextSibling = children[currentIndex + 1];
      if (nextSibling?.type.name !== 'definitionDescription') {
        return {
          apply: (editor: Editor) => {
            const { schema } = editor.state;
            const descType = schema.nodes['definitionDescription'];
            if (!descType) return;
            const desc = descType.create(null, schema.text('Beschrijving'));
            const { tr } = editor.state;
            // Insert the description immediately after the term node
            tr.insert(pos + node.nodeSize, desc);
            editor.view.dispatch(tr);
          },
          boundingBox: getNodeBoundingBox(editor, pos),
          pos,
          severity: validationSeverity.ERROR,
        };
      }
    }
  }
  return null;
};

type ContentValidationKey = (typeof contentValidations)[keyof typeof contentValidations];

export const contentValidatorMap: { [K in ContentValidationKey]: ContentValidator } = {
  [contentValidations.DEFINITION_DESCRIPTION_MUST_FOLLOW_TERM]: definitionDescriptionMustFollowTerm,
  [contentValidations.DESCRIPTION_LIST_MUST_CONTAIN_TERM]: descriptionListMustContainTerm,
  [contentValidations.HEADING_MUST_NOT_BE_EMPTY]: headingMustNotBeEmpty,
  [contentValidations.HEADING_SHOULD_NOT_CONTAIN_BOLD_OR_ITALIC]: headingShouldNotContainBoldOrItalic,
  [contentValidations.IMAGE_MUST_HAVE_ALT_TEXT]: imageMustHaveAltText,
  [contentValidations.LINK_SHOULD_NOT_BE_TOO_GENERIC]: linkShouldNotBeTooGeneric,
  [contentValidations.MARK_SHOULD_NOT_BE_EMPTY]: markShouldNotBeEmpty,
  [contentValidations.MARK_SHOULD_NOT_BE_UNDERLINED]: markShouldNotBeUnderlined,
  [contentValidations.NODE_SHOULD_NOT_BE_EMPTY]: nodeShouldNotBeEmpty,
};

const contentValidator = (
  editor: Editor,
  validatorMap: Partial<{ [K in ContentValidationKey]: ContentValidator }> = contentValidatorMap,
): Map<string, ValidationResult> => {
  const errors: Map<string, ValidationResult> = new Map();

  editor.$doc.node.descendants((node, pos) => {
    for (const [key, validator] of Object.entries(validatorMap)) {
      const result = validator(editor, node, pos);
      if (result) {
        errors.set(`${key}_${pos}`, result);
      }
    }
  });
  return errors;
};

export default contentValidator;
