import Heading from '@tiptap/extension-heading';

const CustomHeadingNode = Heading.configure({
  levels: [1, 2, 3],
});

export default CustomHeadingNode;
