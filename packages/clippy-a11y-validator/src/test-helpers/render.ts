export const render = (html: string): HTMLElement => {
  const container = document.createElement('div');
  container.innerHTML = html;
  return container.firstElementChild as HTMLElement;
};
