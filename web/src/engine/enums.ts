export enum Direction {
  Left = 'LEFT',
  Right = 'RIGHT',
  Down = 'DOWN',
  Drop = 'DROP',
}

export enum Rotation {
  Clockwise = 'CLOCKWISE',
  Anticlockwise = 'ANTICLOCKWISE',
}

export enum Shape {
  I = 'I',
  J = 'J',
  L = 'L',
  O = 'O',
  S = 'S',
  T = 'T',
  Z = 'Z',
}

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 24;
export const DEFAULT_SEED = 42;
export const INTERVAL_MS = 1000;

export type Cell = { x: number; y: number };

export const shapeToCells: Record<Shape, Set<string>> = {
  [Shape.I]: new Set(['0,0','0,1','0,2','0,3']),
  [Shape.J]: new Set(['1,0','1,1','0,2','1,2']),
  [Shape.L]: new Set(['0,0','0,1','0,2','1,2']),
  [Shape.O]: new Set(['0,0','1,0','0,1','1,1']),
  [Shape.S]: new Set(['1,0','2,0','0,1','1,1']),
  [Shape.T]: new Set(['0,0','1,0','2,0','1,1']),
  [Shape.Z]: new Set(['0,0','1,0','1,1','2,1']),
};

export const shapeToColor: Record<Shape, string> = {
  [Shape.I]: 'cyan',
  [Shape.J]: 'blue',
  [Shape.L]: 'orange',
  [Shape.O]: 'yellow',
  [Shape.S]: 'green',
  [Shape.T]: 'magenta',
  [Shape.Z]: 'red',
};

export const shapeToCenter: Record<Shape, { cx: number; cy: number }> = {
  [Shape.I]: { cx: 0.5, cy: 1.5 },
  [Shape.J]: { cx: 1, cy: 1 },
  [Shape.L]: { cx: 0, cy: 1 },
  [Shape.O]: { cx: 0.5, cy: 0.5 },
  [Shape.S]: { cx: 1, cy: 1 },
  [Shape.T]: { cx: 1, cy: 0 },
  [Shape.Z]: { cx: 1, cy: 1 },
};
