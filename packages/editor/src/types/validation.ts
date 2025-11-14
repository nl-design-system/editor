import type { Editor } from '@tiptap/core';
import type { Node } from 'prosemirror-model';
import type { EditorSettings } from '@/types/settings.ts';
import type { ValidationResult } from '@/validators/classes/ValidationResult.ts';

export type BoundingBox = { top: number; height: number };

export type DocumentValidator = (editor: Editor, settings: EditorSettings) => ValidationResult[];

export type ContentValidator = (editor: Editor, node: Node, pos: number) => ValidationResult | null;

export type ValidationSeverity = 'info' | 'warning' | 'error';

export type ValidationsMap = Map<string, ValidationResult>;
