const d = Math.PI / 4;

export enum Direction {
  N = 0,
  NW = d,
  W = 2 * d,
  SW = 3 * d,
  S = 4 * d,
  SE = 5 * d,
  E = 6 * d,
  NE = 7 * d
}

export enum DirectionKey {
  N = 'w',
  S = 's',
  E = 'd',
  W = 'a',
}
