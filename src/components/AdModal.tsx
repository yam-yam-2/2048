import React, { useEffect, useRef, useState } from 'react';
import { X, Sparkles } from 'lucide-react';
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
    let timerId1: ReturnType<typeof setTimeout> | undefined;
    let timerId2: ReturnType<typeof setTimeout> | undefined;

    if (container) {
      container.innerHTML = '';

      const ins = document.createElement('ins');
      ins.className = 'kakao_ad_area';
      ins.style.display = 'none';
      ins.setAttribute('data-ad-unit', 'DAN-q47eRCmntbOzqMuf');
      ins.setAttribute('data-ad-width', '300');
      ins.setAttribute('data-ad-height', '250');

      const script = document.createElement('script');
      script.src = 'https://t1.kakaocdn.net/kas/static/ba.min.js';
      script.async = true;

      container.appendChild(ins);
      container.appendChild(script);
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
      if (timerId1) clearTimeout(timerId1);
      if (timerId2) clearTimeout(timerId2);
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

        {/* 300x250 Ad Container */}
        <div className="w-[300px] h-[250px] bg-stone-100 dark:bg-stone-800 rounded-xl border border-stone-200/80 flex items-center justify-center relative shadow-inner overflow-hidden">
          {/* Subtle loading spinner behind the ad */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
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

