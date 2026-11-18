export const CustomEvents = {
  CLOSE_SIDEBAR: 'CLOSE_SIDEBAR',
  CORRECT_VALIDATION_ISSUE: 'CORRECT_VALIDATION_ISSUE',
  FILTER_CHANGE: 'FILTER_CHANGE',
  FOCUS_BUBBLE_MENU: 'FOCUS_BUBBLE_MENU',
  FOCUS_NODE: 'FOCUS_NODE',
  FOCUS_TOOLBAR: 'FOCUS_TOOLBAR',
  FOCUS_VALIDATION_ITEM_IN_LIST: 'FOCUS_VALIDATION_ITEM_IN_LIST',
  FOCUS_VALIDATION_ITEM_IN_SIDEBAR: 'FOCUS_VALIDATION_ITEM_IN_SIDEBAR',
  OPEN_DOCUMENT_OVERVIEW: 'OPEN_DOCUMENT_OVERVIEW',
  OPEN_IMAGE_DIALOG: 'OPEN_IMAGE_DIALOG',
  OPEN_VALIDATION_GROUP: 'OPEN_VALIDATION_GROUP',
  OPEN_VALIDATIONS_DIALOG: 'OPEN_VALIDATIONS_DIALOG',
  SIDEBAR_TOGGLE: 'SIDEBAR_TOGGLE',
  TEXT_FORMAT_CHANGE: 'TEXT_FORMAT_CHANGE',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
} as const;

export type DocumentOverviewMode = 'heading-structure' | 'language-changes' | 'link-list' | 'validations';

export interface OpenDocumentOverviewDetail {
  identifier?: string;
  mode: DocumentOverviewMode;
}

export type OpenDocumentOverviewEvent = CustomEvent<OpenDocumentOverviewDetail>;

/**
 * Detail for {@link CustomEvents.OPEN_VALIDATION_GROUP}: opens the sidebar showing
 * only the given validation ranges (a single clicked validation plus any that
 * overlap it), with the severity filters hidden.
 */
export interface OpenValidationGroupDetail {
  ranges: Range[];
  identifier?: string;
}

export type OpenValidationGroupEvent = CustomEvent<OpenValidationGroupDetail>;

export interface FocusNodeDetail {
  identifier?: string;
  range: Range;
}

export type FocusNodeEvent = CustomEvent<FocusNodeDetail>;

export interface FocusValidationItemInListDetail {
  range: Range;
}

export type FocusValidationItemInListEvent = CustomEvent<FocusValidationItemInListDetail>;

export interface FocusValidationItemInSidebarDetail {
  identifier?: string;
  range?: Range;
}

export type FocusValidationItemInSidebarEvent = CustomEvent<FocusValidationItemInSidebarDetail>;

export interface CorrectValidationIssueDetail {
  identifier?: string;
}

export type CorrectValidationIssueEvent = CustomEvent<CorrectValidationIssueDetail>;

export interface CloseSidebarDetail {
  identifier?: string;
}

export type CloseSidebarEvent = CustomEvent<CloseSidebarDetail>;

export interface SidebarToggleDetail {
  identifier?: string;
  open: boolean;
}

export type SidebarToggleEvent = CustomEvent<SidebarToggleDetail>;

export interface OpenValidationsDialogDetail {
  identifier?: string;
}

export type OpenValidationsDialogEvent = CustomEvent<OpenValidationsDialogDetail>;

export interface FilterChangeDetail {
  identifier?: string;
  severity: string | null;
}

export type FilterChangeEvent = CustomEvent<FilterChangeDetail>;
