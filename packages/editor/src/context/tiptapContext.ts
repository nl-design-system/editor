import type { Editor } from '@tiptap/core';
import { createContext } from '@lit/context';
export const tiptapContext = createContext<Editor>('tiptap');
