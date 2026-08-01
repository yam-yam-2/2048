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
import { Sparkles, X, PartyPopper, Trophy, Star, Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Helper to load persisted game state
const loadSavedGameState = () => {
  try {
    const raw = localStorage.getItem('2048_game_state');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.tiles) && parsed.tiles.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return null;
};

export default function App() {
  const savedState = loadSavedGameState();

  const [gridSize, setGridSize] = useState<GridSize>(() => {
    if (savedState && [3, 4, 5, 6].includes(savedState.gridSize)) {
      return savedState.gridSize as GridSize;
    }
    try {
      const saved = localStorage.getItem('2048_grid_size');
      if (saved) {
        const parsed = parseInt(saved, 10);
        if ([3, 4, 5, 6].includes(parsed)) return parsed as GridSize;
      }
    } catch {
      // fallback
    }
    return 4;
  });

  const [tiles, setTiles] = useState<Tile[]>(() => savedState?.tiles || []);
  const [score, setScore] = useState<number>(() => savedState?.score ?? 0);
  const [bestScore, setBestScore] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('2048_best') || '0', 10);
    } catch {
      return 0;
    }
  });
  const [maxTile, setMaxTile] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('2048_max_tile') || '0', 10);
    } catch {
      return 0;
    }
  });
  const [totalGames, setTotalGames] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('2048_total_games') || '0', 10);
    } catch {
      return 0;
    }
  });

  const [gameOver, setGameOver] = useState<boolean>(() => savedState?.gameOver ?? false);
  const [won, setWon] = useState<boolean>(() => savedState?.won ?? false);
  const [keepPlaying, setKeepPlaying] = useState<boolean>(() => savedState?.keepPlaying ?? false);
  const [moveCount, setMoveCount] = useState<number>(() => savedState?.moveCount ?? 0);

  // Settings: Sound, Theme & Haptics Persistent Values
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('2048_sound');
      if (saved !== null) {
        const val = JSON.parse(saved);
        sounds.enabled = val;
        return val;
      }
    } catch {
      // fallback
    }
    return true;
  });

  // Track achieved milestone values (e.g., 32, 2048) in current game
  const [achievedMilestones, setAchievedMilestones] = useState<number[]>(() => savedState?.achievedMilestones || []);
  const [milestoneBanner, setMilestoneBanner] = useState<number | null>(null);

  // Settings: Theme & Haptics
  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      return (localStorage.getItem('2048_theme') as ThemeMode) || 'classic';
    } catch {
      return 'classic';
    }
  });
  const [hapticsEnabled, setHapticsEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('2048_haptics');
      if (saved !== null) {
        const val = JSON.parse(saved);
        haptics.enabled = val;
        return val;
      }
    } catch {
      // fallback
    }
    return haptics.enabled;
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [canInstallPwa, setCanInstallPwa] = useState<boolean>(false);
  const [pwaInstalledSuccess, setPwaInstalledSuccess] = useState<boolean>(false);

  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setPwaInstalledSuccess(true);
        }
        setDeferredPrompt(null);
        setCanInstallPwa(false);
      } catch {
        // ignore
      }
    }
  };

  // History stack for Undo feature
  const [history, setHistory] = useState<{ tiles: Tile[]; score: number }[]>(() => savedState?.history || []);

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
      // Do not preventDefault() so browser native URL bar install icon remains visible
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
    try {
      localStorage.setItem('2048_haptics', JSON.stringify(nextVal));
    } catch {
      // LocalStorage fallback
    }
    if (nextVal) {
      haptics.vibrateMove();
    }
  };

  // Track new record state
  const [isNewRecordAlert, setIsNewRecordAlert] = useState<boolean>(false);
  const [hasNewRecordTriggered, setHasNewRecordTriggered] = useState<boolean>(false);

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
    setHasNewRecordTriggered(false);
    setIsNewRecordAlert(false);

    try {
      localStorage.setItem('2048_grid_size', size.toString());
    } catch {
      // LocalStorage fallback
    }

    setTotalGames((prev) => {
      const next = prev + 1;
      try {
        localStorage.setItem('2048_total_games', next.toString());
      } catch {
        // LocalStorage fallback
      }
      return next;
    });
  }, []);

  // Initial load - start new game only if no saved state exists
  useEffect(() => {
    if (tiles.length === 0) {
      startNewGame(gridSize);
    }
  }, [gridSize, startNewGame, tiles.length]);

  // Persist active game state whenever relevant parameters change
  useEffect(() => {
    if (tiles.length === 0) return;
    try {
      const gameState = {
        gridSize,
        tiles,
        score,
        gameOver,
        won,
        keepPlaying,
        moveCount,
        history,
        achievedMilestones,
      };
      localStorage.setItem('2048_game_state', JSON.stringify(gameState));
    } catch (e) {
      console.error('Failed to persist game state:', e);
    }
  }, [gridSize, tiles, score, gameOver, won, keepPlaying, moveCount, history, achievedMilestones]);

  // Track max tile value achieved across games
  useEffect(() => {
    if (tiles.length > 0) {
      const currentMax = Math.max(...tiles.map((t) => t.value), 0);
      if (currentMax > maxTile) {
        setMaxTile(currentMax);
        try {
          localStorage.setItem('2048_max_tile', currentMax.toString());
        } catch {
          // LocalStorage fallback
        }
      }
    }
  }, [tiles, maxTile]);

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

  // Fire celebratory floating banner for milestones (4, 8, 16, 32, 64, etc.)
  const triggerCelebration = useCallback((targetValue: number) => {
    setMilestoneBanner(targetValue);
    setTimeout(() => {
      setMilestoneBanner(null);
    }, 3000);
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

        // Check for Best Score New Record
        if (newScore > bestScore && bestScore > 0 && !hasNewRecordTriggered) {
          setHasNewRecordTriggered(true);
          setIsNewRecordAlert(true);
          sounds.playNewRecord();

          // Gold burst for new record
          try {
            confetti({
              particleCount: 60,
              spread: 80,
              origin: { y: 0.2 },
              colors: ['#FFD700', '#F59E0B', '#FBBF24'],
            });
          } catch {
            // ignore
          }

          setTimeout(() => {
            setIsNewRecordAlert(false);
          }, 4000);
        }

        // Sound & Haptics for regular move / merge
        if (result.mergedValues.length > 0) {
          const maxMerged = Math.max(...result.mergedValues);
          sounds.playMerge(maxMerged);
          haptics.vibrateMerge();
        } else {
          sounds.playMove();
          haptics.vibrateMove();
        }

        // Check for first-time achieved tile milestones in current game (4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048...)
        const milestoneValues = [4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192];
        const presentMilestones = milestoneValues.filter((val) => nextTiles.some((t) => t.value === val));
        const newMilestones = presentMilestones.filter((val) => !achievedMilestones.includes(val));

        if (newMilestones.length > 0) {
          setAchievedMilestones((prev) => [...prev, ...newMilestones]);
          const highestNew = Math.max(...newMilestones);
          if (highestNew >= 2048 && !won) {
            setWon(true);
          }
          triggerCelebration(highestNew);
        }

        if (!canMove(nextTiles, gridSize)) {
          setGameOver(true);
          sounds.playGameOver();
          haptics.vibrateGameOver();
        }
      }
    },
    [tiles, gridSize, score, gameOver, won, keepPlaying, achievedMilestones, triggerCelebration, bestScore, hasNewRecordTriggered]
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
      try {
        localStorage.setItem('2048_sound', JSON.stringify(next));
      } catch {
        // LocalStorage fallback
      }
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
      className={`min-h-screen ${currentTheme.appBg} flex flex-col items-center justify-between font-sans p-2 sm:p-4 pb-36 sm:pb-40 transition-colors duration-300 selection:bg-amber-200 relative`}
    >
      {/* Floating New Record Celebration Banner (Theme Matched) */}
      {isNewRecordAlert && (
        <div className="fixed top-4 z-50 animate-bounce transition-all duration-300 pointer-events-none">
          <div className={`${currentTheme.bannerBg} font-black px-4.5 py-2.5 rounded-full shadow-2xl border-2 flex items-center gap-2 text-xs sm:text-sm backdrop-blur-xs`}>
            <Trophy className="w-4 h-4 text-amber-300 fill-amber-400 animate-spin shrink-0" />
            <span>NEW RECORD! 🎉 최고 점수 갱신 ({score}점)</span>
            <Sparkles className="w-4 h-4 shrink-0" />
          </div>
        </div>
      )}

      {/* Floating Milestone Celebration Banner (Theme Matched) */}
      {milestoneBanner !== null && (
        <div className="fixed top-16 z-50 animate-bounce transition-all duration-300 pointer-events-none">
          <div className={`${currentTheme.bannerBg} font-black px-4.5 py-2 rounded-full shadow-2xl border-2 flex items-center gap-2 text-xs sm:text-sm backdrop-blur-xs`}>
            <PartyPopper className="w-4 h-4 shrink-0" />
            <span>🎉 최초 달성!</span>
            <span className={`px-2.5 py-0.5 rounded-md text-xs font-black shadow-xs ${currentTheme.getTileStyle(milestoneBanner)}`}>
              {milestoneBanner}
            </span>
            <span>타일 완성</span>
            <Sparkles className="w-4 h-4 shrink-0" />
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="w-full max-w-[440px] flex flex-col items-center flex-1 space-y-2 sm:space-y-3">
        {/* PWA Prompt Banner for Samsung Internet / Android (only when install prompt is triggered) */}
        {canInstallPwa && (
          <div className="w-full bg-gradient-to-r from-amber-700 to-amber-800 text-white p-2.5 sm:p-3 rounded-2xl shadow-lg flex items-center justify-between gap-2 border border-amber-600 animate-fade-in">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 bg-amber-600/80 rounded-xl shrink-0">
                <Download className="w-5 h-5 text-amber-100" />
              </div>
              <div className="min-w-0">
                <p className="font-extrabold text-xs text-amber-100">2048 앱 설치하기</p>
                <p className="text-[11px] text-amber-200/90 truncate">홈 화면에 2048을 추가하고 바로 플레이해보세요!</p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={handleInstallPwa}
                className="px-3 py-1.5 bg-white text-amber-900 font-black text-xs rounded-xl shadow-xs hover:bg-amber-100 active:scale-95 transition-all cursor-pointer"
              >
                설치
              </button>
              <button
                onClick={() => setCanInstallPwa(false)}
                className="p-1 text-amber-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {pwaInstalledSuccess && (
          <div className="w-full bg-emerald-700 text-white p-2.5 sm:p-3 rounded-2xl shadow-lg flex items-center gap-2 border border-emerald-500 text-xs font-bold animate-fade-in">
            <Sparkles className="w-4 h-4 text-emerald-200 shrink-0" />
            <span>앱 설치가 완료되었습니다! 홈 화면에서 바로 실행할 수 있습니다.</span>
          </div>
        )}

        {/* Header Section */}
        <Header
          score={score}
          bestScore={bestScore}
          gridSize={gridSize}
          soundEnabled={soundEnabled}
          canUndo={history.length > 0}
          theme={theme}
          onGridSizeChange={handleGridSizeChangeRequest}
          onNewGameRequest={handleNewGameRequest}
          onUndo={handleUndoRequest}
          onToggleSound={handleToggleSound}
          onOpenSettings={() => setIsSettingsOpen(true)}
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

      {/* Always Visible Fixed Bottom Ad Unit */}
      <footer className="w-full max-w-[440px] fixed bottom-0 left-1/2 -translate-x-1/2 z-40 px-2 pb-2 pt-1 pointer-events-auto">
        <AdBanner position="bottom" theme={theme} />
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        theme={theme}
        soundEnabled={soundEnabled}
        hapticsEnabled={hapticsEnabled}
        maxTile={maxTile}
        bestScore={bestScore}
        totalGames={totalGames}
        onThemeChange={handleThemeChange}
        onToggleSound={handleToggleSound}
        onToggleHaptics={handleToggleHaptics}
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
