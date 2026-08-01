import React, { useEffect, useRef, useState } from 'react';
import { X, Sparkles, Award } from 'lucide-react';
import { sounds } from '../utils/sound';

interface AdModalProps {
  isOpen: boolean;
  actionType: 'undo' | 'newGame' | null;
  onCloseAndProceed: () => void;
}

export const AdModal: React.FC<AdModalProps> = ({ isOpen, actionType, onCloseAndProceed }) => {
  const kakaoContainerRef = useRef<HTMLDivElement>(null);
  const [countdown, setCountdown] = useState<number>(3);
  const [canSkip, setCanSkip] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      setCanSkip(false);
      setCountdown(3);
      return;
    }

    sounds.playAdRefresh();
    setCanSkip(false);
    setCountdown(3);

    const container = kakaoContainerRef.current;
    let t1: ReturnType<typeof setTimeout> | undefined;

    if (container) {
      container.innerHTML = '';

      const ins = document.createElement('ins');
      ins.className = 'kakao_ad_area';
      ins.style.display = 'none';
      ins.setAttribute('data-ad-unit', 'DAN-q47eRCmntbOzqMuf');
      ins.setAttribute('data-ad-width', '300');
      ins.setAttribute('data-ad-height', '250');

      container.appendChild(ins);

      const renderAdfit = () => {
        if (!ins.isConnected) return;
        try {
          const globalAdfit = (window as unknown as { adfit?: { render?: () => void } }).adfit;
          if (globalAdfit && typeof globalAdfit.render === 'function') {
            globalAdfit.render();
          }
        } catch {
          // ignore
        }
      };

      const existingScript = document.querySelector('script[src*="kas/static/ba.min.js"]');
      if (!existingScript) {
        const script = document.createElement('script');
        script.src = 'https://t1.kakaocdn.net/kas/static/ba.min.js';
        script.async = true;
        script.onload = () => renderAdfit();
        document.head.appendChild(script);
      } else {
        renderAdfit();
        t1 = setTimeout(renderAdfit, 100);
      }
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanSkip(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      if (t1) clearTimeout(t1);
      if (container) {
        try {
          container.innerHTML = '';
        } catch {
          // ignore
        }
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isUndo = actionType === 'undo';
  const messageText = isUndo ? '되돌리기가 즉시 실행됩니다!' : '새 게임이 즉시 시작됩니다!';
  const buttonSkipText = isUndo ? '확인 및 되돌리기 실행' : '확인 및 새 게임 시작';
  const buttonWaitText = (sec: number) => (isUndo ? `${sec}초 후 되돌리기 가능` : `${sec}초 후 새 게임 가능`);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl p-4 w-full max-w-[340px] flex flex-col items-center text-center shadow-2xl border border-amber-200/80 relative">
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="text-[11px] bg-amber-100 text-amber-900 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-600" /> 스폰서 보상형 광고
          </span>
        </div>
        <p className="text-xs text-stone-700 mb-3 font-semibold">
          스폰서 광고 시청 후 <strong className="text-amber-800">{messageText}</strong>
        </p>

        {/* 300x250 Ad Container with fallback preview */}
        <div className="w-[300px] h-[250px] bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200/70 flex items-center justify-center relative shadow-inner overflow-hidden">
          {/* Background Fallback Banner if ad script is blocked or loading */}
          <div className="absolute inset-0 p-4 flex flex-col items-center justify-center text-amber-900/60 pointer-events-none">
            <Award className="w-10 h-10 mb-2 text-amber-500/80 animate-bounce" />
            <span className="text-xs font-bold text-amber-900">2048 PUZZLE GAME</span>
            <p className="text-[10px] text-amber-700/80 mt-1">최고 기록 갱신에 도전하세요!</p>
          </div>

          <div
            ref={kakaoContainerRef}
            className="w-[300px] h-[250px] flex items-center justify-center relative z-10"
          />
        </div>

        {/* Action Button to Proceed */}
        <div className="w-full mt-4">
          <button
            onClick={onCloseAndProceed}
            disabled={!canSkip}
            className={`w-full py-2.5 px-4 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 ${
              canSkip
                ? 'bg-amber-800 hover:bg-amber-900 active:scale-95 text-white cursor-pointer shadow-md'
                : 'bg-stone-300 text-stone-500 cursor-not-allowed opacity-80'
            }`}
          >
            {canSkip ? (
              <>
                <span>{buttonSkipText}</span>
                <X className="w-4 h-4" />
              </>
            ) : (
              <span>{buttonWaitText(countdown)}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

