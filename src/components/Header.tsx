import React from 'react';
import { RotateCcw, Volume2, VolumeX, Play, Trophy, Download } from 'lucide-react';
import { GridSize } from '../types';

interface HeaderProps {
  score: number;
  bestScore: number;
  gridSize: GridSize;
  soundEnabled: boolean;
  canUndo: boolean;
  canInstallPwa?: boolean;
  onGridSizeChange: (newSize: GridSize) => void;
  onNewGameRequest: () => void;
  onUndo: () => void;
  onToggleSound: () => void;
  onInstallPwa?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  score,
  bestScore,
  gridSize,
  soundEnabled,
  canUndo,
  canInstallPwa,
  onGridSizeChange,
  onNewGameRequest,
  onUndo,
  onToggleSound,
  onInstallPwa,
}) => {
  return (
    <header className="w-full max-w-[420px] mx-auto px-1 pt-2 pb-2">
      {/* Top bar: Title + Score Boxes */}
      <div className="flex items-center justify-between mb-2.5 gap-2">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#776E65] leading-none">
              2048
            </h1>
            <span className="text-[10px] sm:text-xs px-1.5 py-0.5 rounded-md bg-amber-200 text-amber-900 font-bold border border-amber-300 shadow-2xs uppercase">
              Classic
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-[#776E65]/80 mt-1 font-medium">
            타일을 합쳐 2048을 만드세요!
          </p>
        </div>

        {/* Scores */}
        <div className="flex gap-1.5 shrink-0">
          <div className="bg-[#8F7A66] text-white px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl text-center min-w-[64px] sm:min-w-[72px] shadow-xs flex flex-col justify-center">
            <span className="text-[9px] sm:text-[10px] font-bold text-[#EEE4DA] uppercase tracking-wider">SCORE</span>
            <span className="text-base sm:text-lg font-bold leading-tight truncate">{score}</span>
          </div>

          <div className="bg-[#8F7A66]/90 text-white px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl text-center min-w-[64px] sm:min-w-[72px] shadow-xs flex flex-col justify-center">
            <div className="flex items-center justify-center gap-0.5 text-[9px] sm:text-[10px] font-bold text-[#EEE4DA] uppercase tracking-wider">
              <Trophy className="w-2.5 h-2.5 text-amber-300 shrink-0" />
              BEST
            </div>
            <span className="text-base sm:text-lg font-bold leading-tight truncate">{bestScore}</span>
          </div>
        </div>
      </div>

      {/* Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between bg-[#BBADA0]/15 p-2 rounded-2xl gap-2 border border-[#BBADA0]/30 shadow-xs">
        {/* Left: Size Selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-[#776E65] whitespace-nowrap">판 크기:</span>
          <select
            id="grid-size-select"
            value={gridSize}
            onChange={(e) => onGridSizeChange(Number(e.target.value) as GridSize)}
            className="bg-[#8F7A66] text-white text-xs font-bold py-1.5 px-2 rounded-lg cursor-pointer hover:bg-[#8F7A66]/90 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
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
          {/* PWA Install Button */}
          {canInstallPwa && (
            <button
              onClick={onInstallPwa}
              title="앱으로 설치하기 (PWA)"
              className="flex items-center gap-1 px-2 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer animate-pulse"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">앱 설치</span>
            </button>
          )}

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? '음소거' : '소리 켜기'}
            className="p-1.5 rounded-lg bg-[#8F7A66] text-white hover:bg-[#8F7A66]/90 active:scale-95 transition-all cursor-pointer"
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
            className="flex items-center gap-1 px-2.5 py-1.5 bg-[#8F7A66] text-white hover:bg-[#776E65] active:scale-95 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer whitespace-nowrap"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>새 게임</span>
          </button>
        </div>
      </div>
    </header>
  );
};
