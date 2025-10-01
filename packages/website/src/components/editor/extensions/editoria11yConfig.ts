export const editoria11yConfig = {

  // We want the box to open automatically for errors:
  alertMode: 'assertive',

  // Prevent this user from hiding alerts.
  allowHide: false,

  allowOK: true,

  // Define content regions
  checkRoots: '.tiptap.ProseMirror',

  // If a tooltip is being drawn on an element
  // that might be invisible, warn the user first:
  checkVisible: true,

  cssUrls: [
    '/editoria11y.min.css',
  ],

  // Don't scan while the editor toolbar is open:
  doNotRun: ".editor-toolbar",
  // Dispatch a JS event before highlighting this,
  // so our JS can modify it first:
  hiddenHandlers: ".accordion-panel",

  // Content editors cannot edit these elements:
  ignoreElements: 'nav *, #social-block',

  // Our external link icon has visually hidden text
  // to delete before checking if the link has text:
  linkIgnoreStrings: ['(opens in new window)'],

  // Define Web components to include in checks
  shadowComponents: 'accordion, lightbox',
}
