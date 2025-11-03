import type { Node } from 'prosemirror-model';
import { type Editor, Extension } from '@tiptap/core';
import type { ValidationMeta } from '@/context/validationsContext.ts';
import type { ValidationError } from '../types/validation.ts';
import { debounce } from '../utils/debounce.ts';
import { a11yValidations } from './a11yValidations.ts';

type Validator = (node: Node, pos: number, editor: Editor) => ValidationError | null;

const validators = new Map<string, Validator[]>();

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

registerValidator('heading', (node, position) => {
  if (isEmpty(node)) {
    const payload: ValidationError = {
      id: a11yValidations.HEADING_MUST_NOT_BE_EMPTY,
      position,
    };
    return payload;
  }

  return null;
});

const getNodeBoundingBox = (editor: Editor, pos: number): { top: number; height: number } | null => {
  const domNode = editor.view.nodeDOM(pos);
  if (domNode instanceof HTMLElement) {
    return { height: domNode.offsetHeight, top: domNode.offsetTop };
  }
  return null;
};

const errorKey = (e: ValidationError) => `${e.id}::${e.position}`;

const runValidation = (editor: Editor, callback: (resultMap: Map<string, ValidationMeta>) => void) => {
  const resultMap = new Map<string, ValidationMeta>();
  editor.state.doc.descendants((node, pos) => {
    const nodeValidators = validators.get(node.type.name);
    if (!nodeValidators || nodeValidators.length === 0) return true;
    for (const validator of nodeValidators) {
      try {
        const result = validator(node, pos, editor);
        if (result) {
          resultMap.set(errorKey(result), {
            id: result.id,
            boundingBox: getNodeBoundingBox(editor, pos),
            ignore: false,
            pos,
            severity: 'warning',
          });
        }
      } catch (err) {
        console.error('validator error', err);
      }
    }
    return true;
  });
  callback(resultMap);
};

const debouncedValidate = debounce(runValidation, 500);

export default Extension.create({
  name: 'validation',

  onCreate({ editor }) {
    const { updateValidationsContext } = this.options;
    debouncedValidate(editor, updateValidationsContext);
  },

  onUpdate({ editor }) {
    const { updateValidationsContext } = this.options;
    debouncedValidate(editor, updateValidationsContext);
  },
});
