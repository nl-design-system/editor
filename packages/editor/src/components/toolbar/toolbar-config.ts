export type ToolbarItemId =
  | 'format-select'
  | 'language-select'
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strike'
  | 'code'
  | 'highlight'
  | 'superscript'
  | 'subscript'
  | 'undo'
  | 'redo'
  | 'ordered-list'
  | 'bullet-list'
  | 'definition-list'
  | 'insert-table'
  | 'text-align'
  | 'link'
  | 'image-upload'
  | 'horizontal-rule'
  | 'text-direction-ltr'
  | 'text-direction-rtl'
  | 'keyboard-shortcuts'
  | 'accessibility-notifications';

export interface ToolbarGroupConfig {
  id: string;
  label?: string;
  items: ToolbarItemId[];
}

export type ToolbarConfig = ToolbarGroupConfig[];

export const defaultToolbarConfig: ToolbarConfig = [
  {
    id: 'selects',
    items: ['format-select', 'language-select'],
  },
  {
    id: 'text-styling',
    items: ['bold', 'italic', 'underline', 'strike', 'code', 'highlight', 'superscript', 'subscript'],
  },
  {
    id: 'history',
    items: ['undo', 'redo'],
  },
  {
    id: 'lists',
    items: ['ordered-list', 'bullet-list', 'definition-list'],
  },
  {
    id: 'table',
    items: ['insert-table'],
  },
  {
    id: 'alignment',
    items: ['text-align'],
  },
  {
    id: 'insert',
    items: ['link', 'image-upload', 'horizontal-rule'],
  },
  {
    id: 'text-direction',
    items: ['text-direction-ltr', 'text-direction-rtl'],
  },
  {
    id: 'tools',
    items: ['keyboard-shortcuts', 'accessibility-notifications'],
  },
];
