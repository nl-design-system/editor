import type { Node } from 'prosemirror-model';
import { type Editor, Extension } from '@tiptap/core';
import type { ValidationError } from '../types/validation.ts';
import { CustomEvents } from '../events';
import { debounce } from '../utils/debounce.ts';

type Validator = (node: Node, pos: number, editor: Editor) => ValidationError[];

const validators = new Map<string, Validator[]>();

const getDomRect = (editor: Editor, pos: number): DOMRect | null => {
  const domNode = editor.view.nodeDOM(pos);
  if (domNode instanceof HTMLElement) {
    return domNode.getClientRects()[0];
  }
  return null;
};

export function registerValidator(nodeType: string, v: Validator) {
  const arr = validators.get(nodeType) ?? [];
  arr.push(v);
  validators.set(nodeType, arr);
}

const isEmptyOrWhitespaceString = (str: string): boolean => /^\s*$/.test(str);

const isEmpty = (node: Node): boolean => {
  if (node.type.name === 'text') {
    return !node.text || isEmptyOrWhitespaceString(node.text);
  } else if (node.content?.content) {
    return node.content?.content.every((node) => isEmpty(node));
  }
  return true;
};

registerValidator('heading', (node, pos, editor) => {
  const textContent = node.textContent ?? '';

  if (isEmpty(node)) {
    const payload: ValidationError = {
      id: pos,
      domRect: getDomRect(editor, pos),
      message: 'Heading must not be empty',
      textContent,
    };
    return [payload];
  }

  return [];
});

const runValidation = (editor: Editor) => {
  const errors: ValidationError[] = [];

  editor.state.doc.descendants((node, pos) => {
    const nodeValidators = validators.get(node.type.name);
    if (!nodeValidators || nodeValidators.length === 0) return true;
    for (const v of nodeValidators) {
      try {
        const result = v(node, pos, editor);
        if (result && result.length) {
          errors.push(...result);
        }
      } catch (err) {
        console.error('validator error', err);
      }
    }

    return true;
  });

  for (const payload of errors) {
    window.dispatchEvent(new CustomEvent(CustomEvents.VALIDATION_ERROR, { detail: payload }));
  }

  return errors;
};

const debouncedValidate = debounce(runValidation, 150);

export default Extension.create({
  name: 'validation',

  onCreate({ editor }) {
    debouncedValidate(editor);
  },

  onUpdate({ editor }) {
    debouncedValidate(editor);
  },
});
