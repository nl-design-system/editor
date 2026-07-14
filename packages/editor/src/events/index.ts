export const CustomEvents = {
  CORRECT_VALIDATION_ISSUE: 'CORRECT_VALIDATION_ISSUE',
  FILTER_CHANGE: 'FILTER_CHANGE',
  FOCUS_BUBBLE_MENU: 'FOCUS_BUBBLE_MENU',
  FOCUS_NODE: 'FOCUS_NODE',
  FOCUS_TOOLBAR: 'FOCUS_TOOLBAR',
  FOCUS_VALIDATION_ITEM_IN_DRAWER: 'FOCUS_VALIDATION_ITEM_IN_DRAWER',
  FOCUS_VALIDATION_ITEM_IN_GUTTER: 'FOCUS_VALIDATION_ITEM_IN_GUTTER',
  FOCUS_VALIDATION_ITEM_IN_LIST: 'FOCUS_VALIDATION_ITEM_IN_LIST',
  OPEN_DOCUMENT_OVERVIEW: 'OPEN_DOCUMENT_OVERVIEW',
  OPEN_IMAGE_DIALOG: 'OPEN_IMAGE_DIALOG',
  OPEN_VALIDATIONS_DIALOG: 'OPEN_VALIDATIONS_DIALOG',
  TEXT_FORMAT_CHANGE: 'TEXT_FORMAT_CHANGE',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
} as const;

export type DocumentOverviewMode = 'heading-structure' | 'language-changes' | 'link-list' | 'validations';

export interface OpenDocumentOverviewDetail {
  identifier?: string;
  mode: DocumentOverviewMode;
}

export type OpenDocumentOverviewEvent = CustomEvent<OpenDocumentOverviewDetail>;

export interface FocusNodeDetail {
  range: Range;
}

export type FocusNodeEvent = CustomEvent<FocusNodeDetail>;

export interface FocusValidationItemInGutterDetail {
  range: Range;
}

export type FocusValidationItemInGutterEvent = CustomEvent<FocusValidationItemInGutterDetail>;

export interface FocusValidationItemInListDetail {
  range: Range;
}

export type FocusValidationItemInListEvent = CustomEvent<FocusValidationItemInListDetail>;

export interface FocusValidationItemInDrawerDetail {
  identifier?: string;
  range?: Range;
}

export type FocusValidationItemInDrawerEvent = CustomEvent<FocusValidationItemInDrawerDetail>;

export interface CorrectValidationIssueDetail {
  identifier?: string;
}

export type CorrectValidationIssueEvent = CustomEvent<CorrectValidationIssueDetail>;

export interface OpenValidationsDialogDetail {
  identifier?: string;
}

export type OpenValidationsDialogEvent = CustomEvent<OpenValidationsDialogDetail>;

export interface FilterChangeDetail {
  identifier?: string;
  severity: string | null;
}

export type FilterChangeEvent = CustomEvent<FilterChangeDetail>;
