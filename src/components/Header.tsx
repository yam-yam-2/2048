import React from 'react';
import { RotateCcw, Volume2, VolumeX, Play, Trophy, Settings } from 'lucide-react';
import { GridSize, ThemeMode } from '../types';
import { THEMES } from '../utils/theme';

interface HeaderProps {
  score: number;
  bestScore: number;
  gridSize: GridSize;
  soundEnabled: boolean;
  canUndo: boolean;
  theme: ThemeMode;
  onGridSizeChange: (newSize: GridSize) => void;
  onNewGameRequest: () => void;
  onUndo: () => void;
  onToggleSound: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  score,
  bestScore,
  gridSize,
  soundEnabled,
  canUndo,
  theme,
  onGridSizeChange,
  onNewGameRequest,
  onUndo,
  onToggleSound,
  onOpenSettings,
}) => {
  const currentTheme = THEMES[theme] || THEMES.classic;

  return (
    <header className="w-full max-w-[420px] mx-auto px-1 pt-2 pb-1">
      {/* Top bar: Title + Score Boxes */}
      <div className="flex items-center justify-between mb-2.5 gap-2">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-none">
              2048
            </h1>
            <span className={`text-[10px] sm:text-xs px-1.5 py-0.5 rounded-md font-bold border shadow-2xs uppercase ${currentTheme.headerAccent}`}>
              {currentTheme.name}
            </span>
          </div>
          <p className="text-[11px] sm:text-xs opacity-80 mt-1 font-medium">
            타일을 합쳐 2048을 만드세요!
          </p>
        </div>

        {/* Scores & Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className={`${currentTheme.headerBoxBg} text-white px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl text-center min-w-[56px] sm:min-w-[64px] shadow-xs flex flex-col justify-center`}>
            <span className="text-[9px] sm:text-[10px] font-bold opacity-80 uppercase tracking-wider">SCORE</span>
            <span className="text-base sm:text-lg font-bold leading-tight truncate">{score}</span>
          </div>

          <div className={`${currentTheme.headerBoxBg} opacity-95 text-white px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl text-center min-w-[56px] sm:min-w-[64px] shadow-xs flex flex-col justify-center`}>
            <div className="flex items-center justify-center gap-0.5 text-[9px] sm:text-[10px] font-bold opacity-80 uppercase tracking-wider">
              <Trophy className="w-2.5 h-2.5 text-amber-300 shrink-0" />
              BEST
            </div>
            <span className="text-base sm:text-lg font-bold leading-tight truncate">{bestScore}</span>
          </div>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            title="게임 설정"
            className={`p-2 rounded-xl text-white ${currentTheme.headerBoxBg} hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-xs`}
          >
            <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between bg-black/5 p-2 rounded-2xl gap-2 border border-black/10 shadow-xs">
        {/* Left: Size Selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold opacity-90 whitespace-nowrap">판 크기:</span>
          <select
            id="grid-size-select"
            value={gridSize}
            onChange={(e) => onGridSizeChange(Number(e.target.value) as GridSize)}
            className={`${currentTheme.headerBoxBg} text-white text-xs font-bold py-1.5 px-2 rounded-lg cursor-pointer hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-amber-500`}
          >
            <option value={3}>3 x 3</option>
            <option value={4}>4 x 4 (기본)</option>
            <option value={5}>5 x 5</option>
            <option value={6}>6 x 6</option>
            <option value={8}>8 x 8</option>
          </select>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? '음소거' : '소리 켜기'}
            className={`p-1.5 rounded-lg text-white ${currentTheme.headerBoxBg} hover:opacity-90 active:scale-95 transition-all cursor-pointer`}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 opacity-70" />}
          </button>

          {/* Undo */}
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="되돌리기"
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-bold text-white transition-all whitespace-nowrap ${
              canUndo
                ? 'bg-amber-600 hover:bg-amber-700 active:scale-95 cursor-pointer shadow-xs'
                : 'bg-gray-400/40 cursor-not-allowed opacity-50'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>되돌리기</span>
          </button>

          {/* New Game */}
          <button
            onClick={onNewGameRequest}
            className={`flex items-center gap-1 px-2.5 py-1.5 ${currentTheme.headerBoxBg} text-white hover:opacity-90 active:scale-95 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer whitespace-nowrap`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>새 게임</span>
          </button>
        </div>
      </div>
    </header>
  );
};
