import FileHandler from '@tiptap/extension-file-handler';
import type { ImageUpload } from '@/types/image.ts';
import { CustomEvents } from '@/events';

export const CustomFileHandler = FileHandler.configure({
  allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
  onDrop: (_, files, position) => {
    const filesToUpload: ImageUpload[] = [];
    for (const file of files) {
      const blobUrl = URL.createObjectURL(file);
      filesToUpload.push({
        name: file.name,
        type: file.type,
        url: blobUrl,
      });
    }
    globalThis.dispatchEvent(
      new CustomEvent(CustomEvents.OPEN_IMAGE_DIALOG, {
        bubbles: true,
        composed: true,
        detail: { files: filesToUpload, position },
      }),
    );
  },
  onPaste: (editor, files, htmlContent) => {
    const filesToUpload: ImageUpload[] = [];
    for (const file of files) {
      if (htmlContent) {
        continue;
      }
      const blobUrl = URL.createObjectURL(file);
      filesToUpload.push({
        name: file.name,
        type: file.type,
        url: blobUrl,
      });
    }

    globalThis.dispatchEvent(
      new CustomEvent(CustomEvents.OPEN_IMAGE_DIALOG, {
        bubbles: true,
        composed: true,
        detail: { files: filesToUpload, position: editor.state.selection.anchor },
      }),
    );
  },
});
