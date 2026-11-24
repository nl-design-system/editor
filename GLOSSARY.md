# Clippy

Clippy gives content editors accessibility feedback based on NL Design System guidelines, both while writing in a rich text editor and on the rendered pages of the CMS they publish to.

## Language

### Features

**Page review**:
Accessibility validation of a rendered page, performed in place and shown in a drawer on that page. A page has at most one Page review. In a CMS it is shown only to permitted logged-in content editors, on saved pages and unsaved draft previews alike. Called Paginacontrole in Dutch text; a CMS label that reads Page review is quoted as it appears.
_Avoid_: Preview, voorbeeld, content views (for the whole feature)

**Drawer**:
The panel that lists the violations and Content views of one Clippy hub. It is always Docked at the end side of the screen, whether it belongs to a rich text editor or to a Page review.
_Avoid_: Sidebar, menu, hub, dialog

**Docked**:
How a Drawer is shown: it reserves its own width at the end side of the screen, so the rest of the page becomes narrower and stays fully visible beside it, instead of being covered.
_Avoid_: Inline (beside the editor only), overlay, fixed

**Content view**:
One of the overviews in the Drawer that summarises a structural aspect of the content: heading structure, link list or language changes.
_Avoid_: Overview, panel

**Review root**:
The element of a rendered page whose content a Page review validates; the page's main content region by default.
_Avoid_: Scope, container

### Implementation

**Clippy hub**:
Produces the violations of one element's live DOM and keeps the trigger, drawer and optional gutter that share its identifier up to date. It also runs the drawer session: it re-validates when the drawer opens, moves focus into the drawer and back to the trigger, and focuses the violation of a drawer item the editor picks. Page review is a Clippy hub on the Review root; the CKEditor plugin and the Tiptap integration each run one on their editable.
_Avoid_: Validate-in-place core, element validation (an element-scoped validation rule in the validator package)

**Tiptap integration**:
Clippy's own Tiptap-based rich text editor, shipped as a web component and wrapped for React, used as-is on the Clippy website.
_Avoid_: "Clippy editor" (that is the product, Clippy Editor), website editor

### Distribution

**Clippy Editor**:
The public name of Clippy as a whole, which each Clippy extension carries as Clippy Editor for Drupal or Clippy Editor for TYPO3 (Clippy Editor voor Drupal, Clippy Editor voor TYPO3 in Dutch text). It is a name without an article: "Clippy Editor helpt redacteuren", not "de Clippy Editor".
_Avoid_: Clippy (on its own, in user-facing text), Editor, Rich-text Editor, NL Design System Editor

**Clippy extension**:
The installable CMS package (Drupal module, TYPO3 extension) that bundles all Clippy features for that CMS, such as the CKEditor integration and Page review.
_Avoid_: Plugin (reserved for the CKEditor plugin), kit

**Extension archive**:
The versioned archive file of one Clippy extension that a site builder downloads and installs from.
_Avoid_: Zip, bundle, artifact, release package

**Extension release**:
The GitHub Release that holds only the Extension archive of one Clippy extension version, published next to, and linking to, the package Release of that version.
_Avoid_: Artifacts release, zip release, secondary release
