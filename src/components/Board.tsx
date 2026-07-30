import React, { useRef, useEffect } from 'react';
import { Tile, GridSize, Direction } from '../types';

interface BoardProps {
  tiles: Tile[];
  gridSize: GridSize;
  onMove: (dir: Direction) => void;
  gameOver: boolean;
  won: boolean;
  keepPlaying: boolean;
  onKeepPlaying: () => void;
  onRestart: () => void;
}

export const Board: React.FC<BoardProps> = ({
  tiles,
  gridSize,
  onMove,
  gameOver,
  won,
  keepPlaying,
  onKeepPlaying,
  onRestart,
}) => {
  const boardRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 's', 'a', 'd'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        switch (e.key.toLowerCase()) {
          case 'arrowup':
          case 'w':
            onMove('up');
            break;
          case 'arrowdown':
          case 's':
            onMove('down');
            break;
          case 'arrowleft':
          case 'a':
            onMove('left');
            break;
          case 'arrowright':
          case 'd':
            onMove('right');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onMove]);

  // Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;

    const diffX = e.changedTouches[0].clientX - touchStartRef.current.x;
    const diffY = e.changedTouches[0].clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    const threshold = 25; // minimum swipe distance

    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (Math.abs(diffX) > threshold) {
        onMove(diffX > 0 ? 'right' : 'left');
      }
    } else {
      if (Math.abs(diffY) > threshold) {
        onMove(diffY > 0 ? 'down' : 'up');
      }
    }
  };

  // Helper for tile styling
  const getTileStyleClass = (value: number) => {
    switch (value) {
      case 2:
        return 'bg-[#EEE4DA] text-[#776E65]';
      case 4:
        return 'bg-[#EDE0C8] text-[#776E65]';
      case 8:
        return 'bg-[#F2B179] text-[#F9F6F2] font-bold';
      case 16:
        return 'bg-[#F59563] text-[#F9F6F2] font-bold';
      case 32:
        return 'bg-[#F67C5F] text-[#F9F6F2] font-bold';
      case 64:
        return 'bg-[#F65E3B] text-[#F9F6F2] font-bold';
      case 128:
        return 'bg-[#EDCF72] text-[#F9F6F2] font-bold shadow-xs';
      case 256:
        return 'bg-[#EDCC61] text-[#F9F6F2] font-bold shadow-xs';
      case 512:
        return 'bg-[#EDC850] text-[#F9F6F2] font-bold shadow-xs';
      case 1024:
        return 'bg-[#EDC53F] text-[#F9F6F2] font-bold shadow-sm';
      case 2048:
        return 'bg-[#EDC22E] text-[#F9F6F2] font-extrabold shadow-md ring-2 ring-amber-300 animate-pulse';
      default:
        return 'bg-[#3C3A32] text-[#F9F6F2] font-extrabold shadow-md';
    }
  };

  const getFontSizeClass = (value: number, size: GridSize) => {
    const digits = value.toString().length;
    if (size >= 6) {
      if (digits >= 4) return 'text-[10px] sm:text-xs';
      if (digits >= 3) return 'text-xs sm:text-sm';
      return 'text-sm sm:text-base';
    }
    if (size === 5) {
      if (digits >= 4) return 'text-xs sm:text-sm';
      if (digits >= 3) return 'text-sm sm:text-base';
      return 'text-base sm:text-lg';
    }
    // 3 or 4 grid size
    if (digits >= 5) return 'text-sm sm:text-base';
    if (digits === 4) return 'text-lg sm:text-xl';
    if (digits === 3) return 'text-xl sm:text-2xl';
    return 'text-2xl sm:text-3xl';
  };

  // Generate background grid cells matrix
  const emptyCells = [];
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      emptyCells.push({ r, c });
    }
  }

  // Balanced responsive gaps and radii
  const gapAndPadding =
    gridSize >= 6
      ? 'gap-1.5 p-2'
      : gridSize === 5
      ? 'gap-2 p-2.5'
      : 'gap-2.5 p-3';

  return (
    <div className="w-full max-w-[420px] mx-auto relative select-none">
      <div
        ref={boardRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`w-full aspect-square bg-[#BBADA0] rounded-2xl ${gapAndPadding} grid relative shadow-md touch-none overflow-hidden`}
        style={{
          gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${gridSize}, minmax(0, 1fr))`,
        }}
      >
        {/* Background grid slots */}
        {emptyCells.map((cell) => (
          <div
            key={`bg-${cell.r}-${cell.c}`}
            className="bg-[#CDC1B4]/70 rounded-lg sm:rounded-xl w-full h-full"
            style={{
              gridRowStart: cell.r + 1,
              gridColumnStart: cell.c + 1,
            }}
          />
        ))}

        {/* Active Tile Items - Perfectly aligned to CSS Grid cells */}
        {tiles.map((tile) => (
          <div
            key={tile.id}
            className={`w-full h-full flex items-center justify-center rounded-lg sm:rounded-xl font-sans transition-all duration-100 ease-out z-10 ${getTileStyleClass(
              tile.value
            )} ${getFontSizeClass(tile.value, gridSize)} ${
              tile.isNew ? 'animate-scale-up' : ''
            } ${tile.mergedFrom ? 'animate-pop' : ''}`}
            style={{
              gridRowStart: tile.row + 1,
              gridColumnStart: tile.col + 1,
            }}
          >
            <span className="font-black tracking-tight select-none pointer-events-none">
              {tile.value}
            </span>
          </div>
        ))}

        {/* Game Over Overlay */}
        {gameOver && (
          <div className="absolute inset-0 bg-[#FAF8EF]/85 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center z-30 animate-fade-in p-4 text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#776E65] mb-2">게임 오버!</h2>
            <p className="text-xs sm:text-sm text-[#776E65]/80 mb-5">더 이상 이동할 수 있는 타일이 없습니다.</p>
            <button
              onClick={onRestart}
              className="px-5 py-2.5 bg-[#8F7A66] hover:bg-[#776E65] text-white font-bold text-sm rounded-xl shadow-md transition-transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              다시 시도하기
            </button>
          </div>
        )}

        {/* Win Overlay (2048 Tile reached) */}
        {won && !keepPlaying && (
          <div className="absolute inset-0 bg-amber-500/90 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center z-30 animate-fade-in p-4 text-center text-white">
            <div className="text-4xl sm:text-5xl mb-2">🎉</div>
            <h2 className="text-3xl sm:text-4xl font-black mb-2">2048 달성!</h2>
            <p className="text-xs sm:text-sm opacity-90 mb-5">축하합니다! 계속해서 더 높은 숫자에 도전해보세요.</p>
            <div className="flex gap-2.5">
              <button
                onClick={onKeepPlaying}
                className="px-4 py-2 bg-white text-amber-900 font-bold rounded-xl shadow-md hover:bg-amber-100 active:scale-95 transition-all cursor-pointer text-xs sm:text-sm"
              >
                계속 플레이
              </button>
              <button
                onClick={onRestart}
                className="px-4 py-2 bg-amber-900/80 text-white font-bold rounded-xl shadow-md hover:bg-amber-950 active:scale-95 transition-all cursor-pointer text-xs sm:text-sm"
              >
                새 게임
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
