import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Tile, GridSize, Direction, ThemeMode } from './types';
import { initializeBoard, addRandomTile, moveBoard, canMove } from './utils/gameLogic';
import { sounds } from './utils/sound';
import { haptics } from './utils/haptics';
import { THEMES } from './utils/theme';
import { Header } from './components/Header';
import { Board } from './components/Board';
import { AdBanner } from './components/AdBanner';
import { AdModal } from './components/AdModal';
import { SettingsModal } from './components/SettingsModal';
import { ConfirmModal } from './components/ConfirmModal';
import { Download, CheckCircle2, Sparkles, X, PartyPopper, Trophy, Star } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function App() {
  const [gridSize, setGridSize] = useState<GridSize>(4);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [score, setScore] = useState<number>(0);
  const [bestScore, setBestScore] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('2048_best') || '0', 10);
    } catch {
      return 0;
    }
  });
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [won, setWon] = useState<boolean>(false);
  const [keepPlaying, setKeepPlaying] = useState<boolean>(false);
  const [moveCount, setMoveCount] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Track achieved milestone values (e.g., 32, 2048) in current game to prevent duplicate celebratory triggers
  const [achievedMilestones, setAchievedMilestones] = useState<number[]>([]);
  const [milestoneBanner, setMilestoneBanner] = useState<number | null>(null);

  // Settings: Theme & Haptics
  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      return (localStorage.getItem('2048_theme') as ThemeMode) || 'classic';
    } catch {
      return 'classic';
    }
  });
  const [hapticsEnabled, setHapticsEnabled] = useState<boolean>(haptics.enabled);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [canInstallPwa, setCanInstallPwa] = useState<boolean>(false);
  const [pwaInstalledSuccess, setPwaInstalledSuccess] = useState<boolean>(false);

  // History stack for Undo feature
  const [history, setHistory] = useState<{ tiles: Tile[]; score: number }[]>([]);

  // Ad Modal State for Undo & New Game
  const [adModalConfig, setAdModalConfig] = useState<{
    isOpen: boolean;
    actionType: 'undo' | 'newGame' | null;
    pendingAction: (() => void) | null;
  }>({
    isOpen: false,
    actionType: null,
    pendingAction: null,
  });

  // Confirmation modal state
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    pendingSize?: GridSize;
    isRestart?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
  });

  // Viewport Space detection for extra mid-board ad
  const [hasSpaceForMidAd, setHasSpaceForMidAd] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Unlock AudioContext and Haptics on first touch/pointer gesture anywhere
  useEffect(() => {
    const handleFirstGesture = () => {
      sounds.init();
      window.removeEventListener('pointerdown', handleFirstGesture);
      window.removeEventListener('touchstart', handleFirstGesture);
    };
    window.addEventListener('pointerdown', handleFirstGesture, { passive: true });
    window.addEventListener('touchstart', handleFirstGesture, { passive: true });
    return () => {
      window.removeEventListener('pointerdown', handleFirstGesture);
      window.removeEventListener('touchstart', handleFirstGesture);
    };
  }, []);

  // PWA beforeinstallprompt event listener
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstallPwa(true);
    };

    const handleAppInstalled = () => {
      setCanInstallPwa(false);
      setDeferredPrompt(null);
      setPwaInstalledSuccess(true);
      setTimeout(() => setPwaInstalledSuccess(false), 5000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallPwa = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setCanInstallPwa(false);
    }
    setDeferredPrompt(null);
  };

  // Theme change handler
  const handleThemeChange = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    try {
      localStorage.setItem('2048_theme', newTheme);
    } catch {
      // LocalStorage fallback
    }
  };

  // Toggle Haptics
  const handleToggleHaptics = () => {
    const nextVal = !hapticsEnabled;
    haptics.enabled = nextVal;
    setHapticsEnabled(nextVal);
    if (nextVal) {
      haptics.vibrateMove();
    }
  };

  // Initialize new game
  const startNewGame = useCallback((size: GridSize) => {
    const initialTiles = initializeBoard(size);
    setGridSize(size);
    setTiles(initialTiles);
    setScore(0);
    setGameOver(false);
    setWon(false);
    setKeepPlaying(false);
    setMoveCount(0);
    setHistory([]);
    setAchievedMilestones([]);
    setMilestoneBanner(null);
  }, []);

  // Initial load
  useEffect(() => {
    startNewGame(4);
  }, [startNewGame]);

  // Viewport Height calculation for mid-ad
  const calculateSpaceForMidAd = useCallback(() => {
    const vh = window.innerHeight;
    setHasSpaceForMidAd(vh >= 700);
  }, []);

  useEffect(() => {
    calculateSpaceForMidAd();
    window.addEventListener('resize', calculateSpaceForMidAd);
    return () => window.removeEventListener('resize', calculateSpaceForMidAd);
  }, [calculateSpaceForMidAd]);

  // Update best score
  useEffect(() => {
    if (score > bestScore) {
      setBestScore(score);
      try {
        localStorage.setItem('2048_best', score.toString());
      } catch {
        // LocalStorage unavailable
      }
    }
  }, [score, bestScore]);

  // Fire celebratory effect for milestones (32 or 2048)
  const triggerCelebration = useCallback((targetValue: number) => {
    sounds.playMilestone();
    haptics.vibrateMilestone();

    // Multi-stage Explosive Confetti Sequence
    try {
      // Stage 1: Left & Right Cannons
      confetti({
        particleCount: 80,
        angle: 60,
        spread: 70,
        origin: { x: 0.05, y: 0.65 },
        colors: ['#FFD700', '#FF4500', '#10B981', '#3B82F6', '#EC4899', '#8B5CF6'],
      });
      confetti({
        particleCount: 80,
        angle: 120,
        spread: 70,
        origin: { x: 0.95, y: 0.65 },
        colors: ['#FFD700', '#FF4500', '#10B981', '#3B82F6', '#EC4899', '#8B5CF6'],
      });

      // Stage 2 (250ms): Center Starburst
      setTimeout(() => {
        confetti({
          particleCount: 110,
          spread: 110,
          origin: { y: 0.45 },
          shapes: ['star', 'circle'],
          colors: ['#FFD700', '#F59E0B', '#FFFFFF', '#EC4899', '#3B82F6'],
          scalar: 1.25,
        });
      }, 250);

      // Stage 3 (600ms): Golden Rain Shower
      setTimeout(() => {
        confetti({
          particleCount: 80,
          spread: 130,
          origin: { y: 0.15 },
          colors: ['#FFD700', '#F59E0B', '#FEF08A'],
          gravity: 0.7,
          ticks: 280,
        });
      }, 600);
    } catch {
      // Ignore
    }

    setMilestoneBanner(targetValue);
  }, []);

  // Handle Tile Move
  const handleMove = useCallback(
    (direction: Direction) => {
      if (gameOver || (won && !keepPlaying)) return;

      const result = moveBoard(tiles, gridSize, direction);

      if (result.moved) {
        setHistory((prev) => [...prev.slice(-9), { tiles, score }]);

        const newScore = score + result.scoreGained;
        let nextTiles = result.tiles;

        nextTiles = addRandomTile(nextTiles, gridSize);

        setTiles(nextTiles);
        setScore(newScore);
        setMoveCount((prev) => prev + 1);

        // Sound & Haptics for regular move / merge
        if (result.mergedValues.length > 0) {
          const maxMerged = Math.max(...result.mergedValues);
          sounds.playMerge(maxMerged);
          haptics.vibrateMerge();
        } else {
          sounds.playMove();
          haptics.vibrateMove();
        }

        // Check Milestone trigger (32 tile requested for test, or 2048)
        const TEST_MILESTONE = 32;
        if (!achievedMilestones.includes(TEST_MILESTONE) && nextTiles.some((t) => t.value >= TEST_MILESTONE)) {
          setAchievedMilestones((prev) => [...prev, TEST_MILESTONE]);
          triggerCelebration(TEST_MILESTONE);
        }

        // Win state at 2048
        if (!won && nextTiles.some((t) => t.value >= 2048)) {
          setWon(true);
          if (!achievedMilestones.includes(2048)) {
            setAchievedMilestones((prev) => [...prev, 2048]);
            triggerCelebration(2048);
          }
        }

        if (!canMove(nextTiles, gridSize)) {
          setGameOver(true);
          sounds.playGameOver();
          haptics.vibrateGameOver();
        }
      }
    },
    [tiles, gridSize, score, gameOver, won, keepPlaying, achievedMilestones, triggerCelebration]
  );

  // Undo Move
  const executeUndo = useCallback(() => {
    if (history.length === 0) return;

    const lastState = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setTiles(lastState.tiles);
    setScore(lastState.score);
    setGameOver(false);
  }, [history]);

  const handleUndoRequest = useCallback(() => {
    if (history.length === 0) return;
    setAdModalConfig({
      isOpen: true,
      actionType: 'undo',
      pendingAction: () => executeUndo(),
    });
  }, [history, executeUndo]);

  const requestNewGameWithAd = useCallback(
    (size: GridSize) => {
      setAdModalConfig({
        isOpen: true,
        actionType: 'newGame',
        pendingAction: () => startNewGame(size),
      });
    },
    [startNewGame]
  );

  // Sound toggle
  const handleToggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      sounds.enabled = next;
      if (next) sounds.playMove();
      return next;
    });
  }, []);

  // Request Grid Size Change
  const handleGridSizeChangeRequest = (newSize: GridSize) => {
    if (newSize === gridSize) return;

    if (moveCount > 0 && !gameOver) {
      setModalConfig({
        isOpen: true,
        title: '새 게임 시작',
        message: `진행 중인 게임이 있습니다.\n${newSize}x${newSize} 로 새 게임을 시작하시겠습니까?`,
        pendingSize: newSize,
      });
    } else {
      requestNewGameWithAd(newSize);
    }
  };

  // Request New Game
  const handleNewGameRequest = () => {
    if (moveCount > 0 && !gameOver) {
      setModalConfig({
        isOpen: true,
        title: '새 게임 시작',
        message: '진행 중인 게임이 있습니다.\n새 게임을 시작하시겠습니까?',
      });
    } else {
      requestNewGameWithAd(gridSize);
    }
  };

  const handleModalConfirm = () => {
    const targetSize = modalConfig.pendingSize || gridSize;
    setModalConfig({ isOpen: false, title: '', message: '' });
    requestNewGameWithAd(targetSize);
  };

  const handleModalCancel = () => {
    setModalConfig({ isOpen: false, title: '', message: '' });
  };

  const handleAdModalProceed = () => {
    if (adModalConfig.pendingAction) {
      adModalConfig.pendingAction();
    }
    setAdModalConfig({ isOpen: false, actionType: null, pendingAction: null });
  };

  const currentTheme = THEMES[theme] || THEMES.classic;

  return (
    <div
      ref={containerRef}
      className={`min-h-screen ${currentTheme.appBg} flex flex-col items-center justify-between font-sans p-2 sm:p-4 transition-colors duration-300 selection:bg-amber-200 relative`}
    >
      {/* Grand Milestone Celebration Modal */}
      {milestoneBanner !== null && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-gradient-to-b from-stone-900 via-stone-850 to-stone-900 text-white rounded-3xl p-6 shadow-2xl border-2 border-amber-400/60 flex flex-col items-center text-center relative overflow-hidden animate-scale-up">
            {/* Ambient radiant background glow */}
            <div className="absolute -top-16 -left-16 w-36 h-36 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -right-16 w-36 h-36 bg-orange-500/20 rounded-full blur-2xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={() => setMilestoneBanner(null)}
              className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Top Trophy & Sparks Badge */}
            <div className="relative mb-3">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-lg shadow-amber-500/30 flex items-center justify-center animate-bounce">
                <div className="w-full h-full bg-stone-900 rounded-[14px] flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-amber-400" />
                </div>
              </div>
              <div className="absolute -top-1 -right-1 text-amber-300 animate-pulse">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold tracking-wider uppercase mb-2">
              <PartyPopper className="w-3.5 h-3.5" />
              축하합니다! 마일스톤 달성
            </div>

            <h3 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-orange-400 mb-1">
              {milestoneBanner} 타일 완성!
            </h3>

            <p className="text-xs text-stone-300 mb-5 leading-relaxed">
              엄청난 실력이군요! <span className="text-amber-300 font-bold">{milestoneBanner}</span> 타일을 만들어냈습니다.
            </p>

            {/* Giant Tile Preview Badge */}
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 p-1 shadow-xl shadow-amber-500/40 mb-6 flex items-center justify-center">
              <div className="w-full h-full bg-stone-900/90 backdrop-blur-xs rounded-xl flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-amber-300 tracking-tight drop-shadow-md">
                  {milestoneBanner}
                </span>
                <span className="text-[10px] text-amber-200/80 font-semibold uppercase tracking-widest mt-0.5">
                  VICTORY
                </span>
              </div>
            </div>

            {/* Continue Action Button */}
            <button
              onClick={() => setMilestoneBanner(null)}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 active:scale-95 text-white font-black text-sm rounded-2xl shadow-lg shadow-amber-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Star className="w-4 h-4 fill-current text-yellow-200" />
              계속 게임하기
            </button>
          </div>
        </div>
      )}

      {/* PWA Install Notification Bar */}
      {canInstallPwa && (
        <div className="w-full max-w-[420px] mx-auto mb-2 px-3 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-xl shadow-sm flex items-center justify-between gap-2 animate-fade-in text-xs font-medium">
          <div className="flex items-center gap-2 truncate">
            <Download className="w-4 h-4 shrink-0 animate-bounce" />
            <span className="truncate">홈 화면에 2048 앱을 설치하고 오프라인에서도 즐기세요!</span>
          </div>
          <button
            onClick={handleInstallPwa}
            className="px-2.5 py-1 bg-white text-emerald-800 font-bold rounded-lg hover:bg-emerald-50 active:scale-95 transition-all shrink-0 cursor-pointer text-xs"
          >
            설치하기
          </button>
        </div>
      )}

      {pwaInstalledSuccess && (
        <div className="w-full max-w-[420px] mx-auto mb-2 px-3 py-2 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl shadow-xs flex items-center gap-2 text-xs font-bold animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>PWA 앱 설치가 완료되었습니다! 언제든지 홈 화면에서 실행하세요.</span>
        </div>
      )}

      {/* Main Container */}
      <main className="w-full max-w-[440px] flex flex-col items-center flex-1 space-y-2 sm:space-y-3">
        {/* Header Section */}
        <Header
          score={score}
          bestScore={bestScore}
          gridSize={gridSize}
          soundEnabled={soundEnabled}
          canUndo={history.length > 0}
          canInstallPwa={canInstallPwa}
          theme={theme}
          onGridSizeChange={handleGridSizeChangeRequest}
          onNewGameRequest={handleNewGameRequest}
          onUndo={handleUndoRequest}
          onToggleSound={handleToggleSound}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onInstallPwa={handleInstallPwa}
        />

        {/* Game Board */}
        <div className="w-full">
          <Board
            tiles={tiles}
            gridSize={gridSize}
            theme={theme}
            onMove={handleMove}
            gameOver={gameOver}
            won={won}
            keepPlaying={keepPlaying}
            onKeepPlaying={() => setKeepPlaying(true)}
            onRestart={() => requestNewGameWithAd(gridSize)}
          />
        </div>

        {/* Mid-Page Ad Unit (Shown when viewport space permits) */}
        {hasSpaceForMidAd && (
          <div className="w-full animate-fade-in">
            <AdBanner position="mid" customTitle="추천 스폰서" theme={theme} />
          </div>
        )}
      </main>

      {/* Sticky Bottom Ad Unit */}
      <footer className="w-full max-w-[440px] mt-auto pt-2">
        <AdBanner position="bottom" theme={theme} />
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        theme={theme}
        soundEnabled={soundEnabled}
        hapticsEnabled={hapticsEnabled}
        canInstallPwa={canInstallPwa}
        onThemeChange={handleThemeChange}
        onToggleSound={handleToggleSound}
        onToggleHaptics={handleToggleHaptics}
        onInstallPwa={handleInstallPwa}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* 300x250 Ad Modal for Undo & New Game */}
      <AdModal
        isOpen={adModalConfig.isOpen}
        actionType={adModalConfig.actionType}
        onCloseAndProceed={handleAdModalProceed}
      />

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        onConfirm={handleModalConfirm}
        onCancel={handleModalCancel}
      />
    </div>
  );
}
