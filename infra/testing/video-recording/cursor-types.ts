// Type definitions for cursor overlay globals

export interface CursorGlobals {
  __e2eCursor?: HTMLElement;
  __mousePosition?: { x: number; y: number };
  __recreateCursor?: () => HTMLElement;
  __updateCursorPosition?: () => void;
  __cursorObserver?: MutationObserver;
}

declare global {
  interface Window extends CursorGlobals {}
}
