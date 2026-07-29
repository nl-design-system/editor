// Always-on content script. The context-menu click handler in the service
// worker has no reference to the right-clicked DOM node, so we record it here at
// `contextmenu` time (capture phase, before any page handler can stop it). The
// reference lives in the extension's isolated world, where the follow-up
// `chrome.scripting.executeScript` reads it.
document.addEventListener(
  'contextmenu',
  (event) => {
    window.__clippyLastRightClicked = event.target instanceof Element ? event.target : null;
  },
  true,
);
