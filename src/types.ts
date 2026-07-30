export type GridSize = 3 | 4 | 5 | 6 | 8;

export type ThemeMode = 'classic' | 'dark' | 'pastel' | 'emerald' | 'sunset';

export interface Tile {
  id: string;
  value: number;
  row: number;
  col: number;
  mergedFrom?: Tile[];
  isNew?: boolean;
}

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface GameState {
  gridSize: GridSize;
  tiles: Tile[];
  score: number;
  bestScore: number;
  gameOver: boolean;
  won: boolean;
  keepPlaying: boolean;
  moveCount: number;
}

export interface AdData {
  id: string;
  title: string;
  sponsor: string;
  description: string;
  badge: string;
  bgGradient: string;
  textColor: string;
  linkUrl: string;
  imageIcon: string;
}

