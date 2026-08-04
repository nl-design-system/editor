import type { Editor } from 'ckeditor5';

// CKEditor's Heading plugin can remap which view tag each model heading level renders as.
// Read the configured options so validators expect the level the editor can actually produce,
// instead of assuming <h1> is always available.
export function resolveTopHeadingLevel(editor: Editor): number {
  const options = editor.config.get('heading.options') ?? [];

  const levels = options
    // paragraph has no `.view`; becomes undefined here
    .map((option) => ('view' in option ? option.view : undefined))
    // heading's view can be a string ('h2') or an object ({ name: 'h2', ... })
    .map((view) => (typeof view === 'string' ? view : view?.name))
    // pull the level digit out of the tag name
    .map((name) => (name ? /^h([1-6])$/.exec(name)?.[1] : undefined))
    // removes paragraph and any non-h1-h6 entries
    .filter((level): level is string => level !== undefined)
    // digit strings to numbers
    .map(Number);

  return levels.length ? Math.min(...levels) : 1;
}
