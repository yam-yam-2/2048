import React from 'react';
import { X, Volume2, VolumeX, Smartphone, Palette, Check, Trophy, Award, Gamepad2, Download } from 'lucide-react';
import { ThemeMode } from '../types';
import { THEMES } from '../utils/theme';

interface SettingsModalProps {
  isOpen: boolean;
  theme: ThemeMode;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  maxTile: number;
  bestScore: number;
  totalGames: number;
  onThemeChange: (theme: ThemeMode) => void;
  onToggleSound: () => void;
  onToggleHaptics: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  theme,
  soundEnabled,
  hapticsEnabled,
  maxTile,
  bestScore,
  totalGames,
  onThemeChange,
  onToggleSound,
  onToggleHaptics,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl p-5 w-full max-w-[360px] shadow-2xl border border-stone-200 text-stone-800 relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
              <Palette className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-stone-800">게임 설정 및 통계</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 0: Player Stats Record */}
        <div className="mb-5">
          <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wide">
            나의 플레이 기록
          </label>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-xl bg-amber-50/90 border border-amber-200/80 flex flex-col items-center justify-center">
              <Trophy className="w-4 h-4 text-amber-600 mb-1" />
              <span className="text-[10px] text-amber-900 font-semibold">최고 점수</span>
              <strong className="text-xs font-black text-amber-950 truncate max-w-full">{bestScore}</strong>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-50/90 border border-amber-200/80 flex flex-col items-center justify-center">
              <Award className="w-4 h-4 text-amber-600 mb-1" />
              <span className="text-[10px] text-amber-900 font-semibold">최고 타일</span>
              <strong className="text-xs font-black text-amber-950 truncate max-w-full">{maxTile > 0 ? maxTile : '-'}</strong>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-50/90 border border-amber-200/80 flex flex-col items-center justify-center">
              <Gamepad2 className="w-4 h-4 text-amber-600 mb-1" />
              <span className="text-[10px] text-amber-900 font-semibold">총 판 수</span>
              <strong className="text-xs font-black text-amber-950 truncate max-w-full">{totalGames}</strong>
            </div>
          </div>
        </div>

        {/* Section 1: Theme Select */}
        <div className="mb-5">
          <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wide">
            테마 선택
          </label>
          <div className="grid grid-cols-1 gap-2">
            {(Object.keys(THEMES) as ThemeMode[]).map((modeKey) => {
              const t = THEMES[modeKey];
              const isSelected = theme === modeKey;
              return (
                <button
                  key={modeKey}
                  onClick={() => onThemeChange(modeKey)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50/80 text-amber-950 shadow-xs ring-1 ring-amber-400'
                      : 'border-stone-200 bg-stone-50/50 hover:bg-stone-100/80 text-stone-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {/* Theme Preview Dot Array */}
                    <div className="flex items-center -space-x-1">
                      <div className={`w-3.5 h-3.5 rounded-full ${t.boardBg}`} />
                      <div className={`w-3.5 h-3.5 rounded-full ${t.getTileStyle(2)}`} />
                      <div className={`w-3.5 h-3.5 rounded-full ${t.getTileStyle(2048)}`} />
                    </div>
                    <span>{t.name}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-amber-600" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Sound & Haptics Toggles */}
        <div className="space-y-3 mb-5 border-t border-stone-100 pt-4">
          <label className="block text-xs font-bold text-stone-600 mb-1 uppercase tracking-wide">
            사운드 & 진동
          </label>

          {/* Sound Toggle */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-200">
            <div className="flex items-center gap-2.5">
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-amber-600" />
              ) : (
                <VolumeX className="w-4 h-4 text-stone-400" />
              )}
              <span className="text-xs font-bold text-stone-700">효과음</span>
            </div>
            <button
              onClick={onToggleSound}
              className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                soundEnabled ? 'bg-amber-600' : 'bg-stone-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  soundEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Haptics Toggle */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-200">
            <div className="flex items-center gap-2.5">
              <Smartphone className={`w-4 h-4 ${hapticsEnabled ? 'text-amber-600' : 'text-stone-400'}`} />
              <span className="text-xs font-bold text-stone-700">터치 진동</span>
            </div>
            <button
              onClick={onToggleHaptics}
              className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                hapticsEnabled ? 'bg-amber-600' : 'bg-stone-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  hapticsEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer Close */}
        <button
          onClick={onClose}
          className="mt-4 w-full py-2.5 bg-stone-800 hover:bg-stone-900 active:scale-95 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md"
        >
          확인
        </button>
      </div>
    </div>
  );
};
