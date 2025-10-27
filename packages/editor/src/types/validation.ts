export interface ValidationError {
  id: number;
  message: string;
  domRect: DOMRect | null;
  textContent: string;
}
