import codeBlockStyle from '@nl-design-system-candidate/code-block-css/code-block.css?inline';
import codeStyle from '@nl-design-system-candidate/code-css/code.css?inline';
import headingStyle from '@nl-design-system-candidate/heading-css/heading.css?inline';
import linkStyle from '@nl-design-system-candidate/link-css/link.css?inline';
import markStyle from '@nl-design-system-candidate/mark-css/mark.css?inline';
import paragraphStyle from '@nl-design-system-candidate/paragraph-css/paragraph.css?inline';
import blockquoteStyle from '@utrecht/blockquote-css/dist/index.css?inline';
import imgStyle from '@utrecht/img-css/dist/index.css?inline';
import orderedListStyle from '@utrecht/ordered-list-css/dist/index.css?inline';
import separatorStyle from '@utrecht/separator-css/dist/index.css?inline';
import subscriptStyle from '@utrecht/subscript-css/dist/index.css?inline';
import superscriptStyle from '@utrecht/superscript-css/dist/index.css?inline';
import tableStyle from '@utrecht/table-css/dist/index.css?inline';
import unorderedListStyle from '@utrecht/unordered-list-css/dist/index.css?inline';
import { unsafeCSS } from 'lit';
import editorStyles from '../../styles';

export const editorContextStyles = [
  editorStyles,
  unsafeCSS(codeBlockStyle),
  unsafeCSS(codeStyle),
  unsafeCSS(headingStyle),
  unsafeCSS(linkStyle),
  unsafeCSS(markStyle),
  unsafeCSS(orderedListStyle),
  unsafeCSS(paragraphStyle),
  unsafeCSS(unorderedListStyle),
  unsafeCSS(tableStyle),
  unsafeCSS(separatorStyle),
  unsafeCSS(subscriptStyle),
  unsafeCSS(superscriptStyle),
  unsafeCSS(blockquoteStyle),
  unsafeCSS(imgStyle),
];
