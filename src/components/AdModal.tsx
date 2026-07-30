import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { sounds } from '../utils/sound';

interface AdModalProps {
  isOpen: boolean;
  actionType: 'undo' | 'newGame' | null;
  onCloseAndProceed: () => void;
}

export const AdModal: React.FC<AdModalProps> = ({ isOpen, actionType, onCloseAndProceed }) => {
  const kakaoContainerRef = useRef<HTMLDivElement>(null);
  const [countdown, setCountdown] = useState<number>(2);
  const [canSkip, setCanSkip] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      setCanSkip(false);
      setCountdown(2);
      return;
    }

    sounds.playAdRefresh();
    setCanSkip(false);
    setCountdown(2);

    // Mount Kakao AdFit 300x250 tag directly
    if (kakaoContainerRef.current) {
      kakaoContainerRef.current.innerHTML = '';

      const ins = document.createElement('ins');
      ins.className = 'kakao_ad_area';
      ins.style.display = 'none';
      ins.setAttribute('data-ad-unit', 'DAN-q47eRCmntbOzqMuf');
      ins.setAttribute('data-ad-width', '300');
      ins.setAttribute('data-ad-height', '250');

      const script = document.createElement('script');
      script.src = 'https://t1.kakaocdn.net/kas/static/ba.min.js';
      script.async = true;

      kakaoContainerRef.current.appendChild(ins);
      kakaoContainerRef.current.appendChild(script);
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

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const isUndo = actionType === 'undo';
  const messageText = isUndo ? '되돌리기가 바로 진행됩니다!' : '새 게임이 바로 시작됩니다!';
  const buttonSkipText = isUndo ? '닫고 되돌리기 진행' : '닫고 새 게임 시작';
  const buttonWaitText = (sec: number) => (isUndo ? `${sec}초 후 되돌리기 가능` : `${sec}초 후 새 게임 시작 가능`);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl p-4 w-full max-w-[340px] flex flex-col items-center text-center shadow-2xl border border-amber-200/80 relative">
        <p className="text-xs text-stone-700 mb-3 font-semibold">
          광고 후 <strong className="text-amber-800">{messageText}</strong>
        </p>

        {/* 300x250 Ad Area Wrapper */}
        <div className="w-[300px] h-[250px] bg-slate-50 rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center relative shadow-inner">
          <div
            ref={kakaoContainerRef}
            className="w-[300px] h-[250px] flex items-center justify-center"
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
