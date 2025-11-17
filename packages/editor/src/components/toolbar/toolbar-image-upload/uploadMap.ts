export const uploadMap = {
  localhost: async (file: File): Promise<unknown> => {
    const url = URL.createObjectURL(file);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ id: null, original: file.name, url });
      }, 1000);
    });
  },
};
