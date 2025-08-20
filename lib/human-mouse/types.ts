// Types for the human-mouse library

export interface Point {
  x: number;
  y: number;
}

export interface ScreenSize {
  width: number;
  height: number;
}

export interface MouseControllerOptions {
  speedFactor?: number;
  virtualDisplay?: boolean;
}

export interface SplineOptions {
  numPoints?: number;
  tension?: number;
}

export interface ClickOptions {
  button?: "left" | "right" | "middle";
  doubleClick?: boolean;
  delay?: number;
}
