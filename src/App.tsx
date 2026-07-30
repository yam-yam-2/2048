import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Tile, GridSize, Direction } from './types';
import { initializeBoard, addRandomTile, moveBoard, canMove } from './utils/gameLogic';
import { sounds } from './utils/sound';
import { Header } from './components/Header';
import { Board } from './components/Board';
import { AdBanner } from './components/AdBanner';
import { ConfirmModal } from './components/ConfirmModal';
import { Info, Download, CheckCircle2, Shield } from 'lucide-react';

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

  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [canInstallPwa, setCanInstallPwa] = useState<boolean>(false);
  const [pwaInstalledSuccess, setPwaInstalledSuccess] = useState<boolean>(false);

  // History stack for Undo feature
  const [history, setHistory] = useState<{ tiles: Tile[]; score: number }[]>([]);

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

  // Space detection for extra mid-board ad
  const [hasSpaceForMidAd, setHasSpaceForMidAd] = useState<boolean>(true);
  const [forceMidAd, setForceMidAd] = useState<boolean | null>(null); // null means auto detect
  const containerRef = useRef<HTMLDivElement>(null);

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
  }, []);

  // Initial load
  useEffect(() => {
    startNewGame(4);
  }, [startNewGame]);

  // Viewport & Container Height space calculation for mid-ad
  const calculateSpaceForMidAd = useCallback(() => {
    if (forceMidAd !== null) {
      setHasSpaceForMidAd(forceMidAd);
      return;
    }

    const vh = window.innerHeight;
    // If viewport height >= 720px, space is sufficient for extra mid ad
    if (vh >= 720) {
      setHasSpaceForMidAd(true);
    } else {
      setHasSpaceForMidAd(false);
    }
  }, [forceMidAd]);

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

        if (result.mergedValues.length > 0) {
          const maxMerged = Math.max(...result.mergedValues);
          sounds.playMerge(maxMerged);
        } else {
          sounds.playMove();
        }

        if (!won && nextTiles.some((t) => t.value >= 2048)) {
          setWon(true);
        }

        if (!canMove(nextTiles, gridSize)) {
          setGameOver(true);
          sounds.playGameOver();
        }
      }
    },
    [tiles, gridSize, score, gameOver, won, keepPlaying]
  );

  // Undo Move
  const handleUndo = useCallback(() => {
    if (history.length === 0) return;

    const lastState = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setTiles(lastState.tiles);
    setScore(lastState.score);
    setGameOver(false);
  }, [history]);

  // Sound toggle
  const handleToggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      sounds.enabled = !prev;
      return !prev;
    });
  }, []);

  // Request Grid Size Change
  const handleGridSizeChangeRequest = (newSize: GridSize) => {
    if (newSize === gridSize) return;

    if (moveCount > 0) {
      setModalConfig({
        isOpen: true,
        title: '새 게임 시작',
        message: `진행 중인 게임이 있습니다.\n${newSize}x${newSize} 로 새 게임을 시작하시겠습니까?`,
        pendingSize: newSize,
      });
    } else {
      startNewGame(newSize);
    }
  };

  // Request New Game
  const handleNewGameRequest = () => {
    if (moveCount > 0) {
      setModalConfig({
        isOpen: true,
        title: '새 게임 시작',
        message: '진행 중인 게임이 있습니다.\n새 게임을 시작하시겠습니까?',
        isRestart: true,
      });
    } else {
      startNewGame(gridSize);
    }
  };

  const handleModalConfirm = () => {
    if (modalConfig.pendingSize) {
      startNewGame(modalConfig.pendingSize);
    } else if (modalConfig.isRestart) {
      startNewGame(gridSize);
    }
    setModalConfig({ isOpen: false, title: '', message: '' });
  };

  const handleModalCancel = () => {
    setModalConfig({ isOpen: false, title: '', message: '' });
  };

  const showMidAd = forceMidAd === true || (forceMidAd === null && hasSpaceForMidAd);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#FAF8EF] flex flex-col items-center justify-between font-sans text-[#776E65] p-2 sm:p-4 selection:bg-amber-200"
    >
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
          onGridSizeChange={handleGridSizeChangeRequest}
          onNewGameRequest={handleNewGameRequest}
          onUndo={handleUndo}
          onToggleSound={handleToggleSound}
          onInstallPwa={handleInstallPwa}
        />

        {/* Game Board */}
        <div className="w-full">
          <Board
            tiles={tiles}
            gridSize={gridSize}
            onMove={handleMove}
            gameOver={gameOver}
            won={won}
            keepPlaying={keepPlaying}
            onKeepPlaying={() => setKeepPlaying(true)}
            onRestart={() => startNewGame(gridSize)}
          />
        </div>

        {/* Space Detection & Extra Mid-Page Ad Area */}
        <div className="w-full transition-all">
          {showMidAd && (
            <div className="animate-fade-in">
              <AdBanner position="mid" customTitle="맞춤 광고" />
            </div>
          )}

          {/* Space Status Bar */}
          <div className="w-full max-w-[420px] mx-auto mt-1 px-2.5 py-1 bg-amber-100/40 rounded-lg border border-amber-200/50 flex items-center justify-between text-[11px] text-amber-900">
            <div className="flex items-center gap-1.5 truncate">
              <Info className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span className="truncate">
                {showMidAd ? (
                  <strong className="text-emerald-700">✓ 공간 여유: 중간 광고 추가 표시 중</strong>
                ) : (
                  <span>공간 부족으로 중간 광고 숨김</span>
                )}
              </span>
            </div>

            <button
              onClick={() => {
                if (forceMidAd === null) setForceMidAd(true);
                else if (forceMidAd === true) setForceMidAd(false);
                else setForceMidAd(null);
              }}
              className="px-2 py-0.5 rounded bg-amber-200/70 hover:bg-amber-300/80 text-amber-900 font-bold transition-colors cursor-pointer shrink-0 text-[10px] ml-1"
            >
              {forceMidAd === null ? '강제 표시' : forceMidAd === true ? '강제 숨김' : '자동 감지'}
            </button>
          </div>
        </div>
      </main>

      {/* Sticky Bottom Ad Unit (Always Visible / 상시 노출) */}
      <footer className="w-full max-w-[440px] mt-auto pt-2">
        <AdBanner position="bottom" />
      </footer>

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
