import { Tile, GridSize, Direction } from '../types';

export function generateTileId(): string {
  return 'tile_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
}

export function getEmptyPositions(tiles: Tile[], size: GridSize): { row: number; col: number }[] {
  const occupied = new Set(tiles.map((t) => `${t.row},${t.col}`));
  const empty: { row: number; col: number }[] = [];

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!occupied.has(`${r},${c}`)) {
        empty.push({ row: r, col: c });
      }
    }
  }
  return empty;
}

export function addRandomTile(tiles: Tile[], size: GridSize): Tile[] {
  const empty = getEmptyPositions(tiles, size);
  if (empty.length === 0) return tiles;

  const randomSpot = empty[Math.floor(Math.random() * empty.length)];

  // Calculate max tile currently on board
  const maxTile = tiles.length > 0 ? Math.max(...tiles.map((t) => t.value)) : 2;

  // Build candidate numbers up to maxTile/2 (capped at 64, minimum 2)
  const candidates: number[] = [2];
  const capLimit = Math.min(maxTile <= 4 ? 4 : Math.floor(maxTile / 2), 64);

  let val = 4;
  while (val <= capLimit) {
    candidates.push(val);
    val *= 2;
  }

  // Calculate exponentially decaying weights so smaller numbers appear much more frequently
  const weights = candidates.map((_, idx) => Math.pow(0.32, idx));
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);

  let rand = Math.random() * totalWeight;
  let selectedValue = 2;

  for (let i = 0; i < candidates.length; i++) {
    if (rand < weights[i]) {
      selectedValue = candidates[i];
      break;
    }
    rand -= weights[i];
  }

  const newTile: Tile = {
    id: generateTileId(),
    value: selectedValue,
    row: randomSpot.row,
    col: randomSpot.col,
    isNew: true,
  };

  return [...tiles, newTile];
}

export function initializeBoard(size: GridSize): Tile[] {
  let tiles: Tile[] = [];
  tiles = addRandomTile(tiles, size);
  tiles = addRandomTile(tiles, size);
  return tiles;
}

export function canMove(tiles: Tile[], size: GridSize): boolean {
  // If there are empty cells, moves are possible
  if (getEmptyPositions(tiles, size).length > 0) return true;

  // Build a size x size matrix
  const grid: (number | null)[][] = Array(size)
    .fill(null)
    .map(() => Array(size).fill(null));

  for (const t of tiles) {
    grid[t.row][t.col] = t.value;
  }

  // Check adjacent matching values
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const val = grid[r][c];
      if (val === null) continue;

      // Right neighbor
      if (c + 1 < size && grid[r][c + 1] === val) return true;
      // Bottom neighbor
      if (r + 1 < size && grid[r + 1][c] === val) return true;
    }
  }

  return false;
}

export interface MoveResult {
  tiles: Tile[];
  moved: boolean;
  scoreGained: number;
  mergedValues: number[];
}

export function moveBoard(tiles: Tile[], size: GridSize, direction: Direction): MoveResult {
  let moved = false;
  let scoreGained = 0;
  const mergedValues: number[] = [];

  // Map to store destination positions
  const newTilesMap: Tile[] = [];

  // Helper vectors for lines
  // We process line by line depending on direction
  const isHorizontal = direction === 'left' || direction === 'right';
  const isReverse = direction === 'right' || direction === 'down';

  for (let line = 0; line < size; line++) {
    // Extract tiles along line
    const lineTiles: Tile[] = tiles.filter((t) => (isHorizontal ? t.row === line : t.col === line));

    // Sort according to move direction
    lineTiles.sort((a, b) => {
      const posA = isHorizontal ? a.col : a.row;
      const posB = isHorizontal ? b.col : b.row;
      return isReverse ? posB - posA : posA - posB;
    });

    let targetPos = isReverse ? size - 1 : 0;
    const step = isReverse ? -1 : 1;

    let skipNext = false;

    for (let i = 0; i < lineTiles.length; i++) {
      if (skipNext) {
        skipNext = false;
        continue;
      }

      const current = lineTiles[i];
      const next = lineTiles[i + 1];

      const currentPos = isHorizontal ? current.col : current.row;

      if (next && current.value === next.value) {
        // Merge!
        const newValue = current.value * 2;
        scoreGained += newValue;
        mergedValues.push(newValue);

        const targetRow = isHorizontal ? line : targetPos;
        const targetCol = isHorizontal ? targetPos : line;

        newTilesMap.push({
          id: generateTileId(),
          value: newValue,
          row: targetRow,
          col: targetCol,
          mergedFrom: [current, next],
          isNew: false,
        });

        moved = true;
        skipNext = true;
        targetPos += step;
      } else {
        // Move without merge
        const targetRow = isHorizontal ? line : targetPos;
        const targetCol = isHorizontal ? targetPos : line;

        if (currentPos !== targetPos) {
          moved = true;
        }

        newTilesMap.push({
          ...current,
          row: targetRow,
          col: targetCol,
          isNew: false,
        });

        targetPos += step;
      }
    }
  }

  return {
    tiles: newTilesMap,
    moved,
    scoreGained,
    mergedValues,
  };
}
