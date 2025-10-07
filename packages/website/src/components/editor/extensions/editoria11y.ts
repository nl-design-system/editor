import { Extension } from '@tiptap/core';

const Editoria11yExtension = Extension.create({
  name: 'customExtension',

  onUpdate() {
    console.log(this.editor.getHTML());
  },
});

export default Editoria11yExtension;
