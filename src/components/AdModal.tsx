import React, { useEffect, useRef, useState } from 'react';
import { X, Sparkles, ExternalLink } from 'lucide-react';
import { sounds } from '../utils/sound';

interface AdModalProps {
  isOpen: boolean;
  actionType: 'undo' | 'newGame' | null;
  onCloseAndProceed: () => void;
}

export const AdModal: React.FC<AdModalProps> = ({ isOpen, actionType, onCloseAndProceed }) => {
  const kakaoContainerRef = useRef<HTMLDivElement>(null);
  const [adLoaded, setAdLoaded] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(2); // 2-second quick delay or skip button
  const [canSkip, setCanSkip] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      setAdLoaded(false);
      setCanSkip(false);
      setCountdown(2);
      return;
    }

    sounds.playAdRefresh();
    setCanSkip(false);
    setCountdown(2);

    // Inject Kakao 300x250 script dynamically
    if (kakaoContainerRef.current) {
      kakaoContainerRef.current.innerHTML = '';

      const ins = document.createElement('ins');
      ins.className = 'kakao_ad_area';
      ins.style.display = 'none';
      ins.setAttribute('data-ad-unit', 'DAN-plmF2YYYa6WbGatK');
      ins.setAttribute('data-ad-width', '300');
      ins.setAttribute('data-ad-height', '250');

      const script = document.createElement('script');
      script.src = 'https://t1.kakaocdn.net/kas/static/ba.min.js';
      script.async = true;
      script.onload = () => setAdLoaded(true);
      script.onerror = () => setAdLoaded(false);

      kakaoContainerRef.current.appendChild(ins);
      kakaoContainerRef.current.appendChild(script);
    }

    // Countdown timer for skip/close button
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
        {/* Header Title */}
        <div className="flex items-center justify-between w-full mb-3 pb-2 border-b border-gray-100">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
            <Sparkles className="w-4 h-4 text-amber-600 animate-spin" />
            <span>스폰서 광고</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
            AD
          </span>
        </div>

        <p className="text-xs text-gray-600 mb-3">
          광고 후 <strong className="text-amber-800">{messageText}</strong>
        </p>

        {/* 300x250 Ad Area Wrapper */}
        <div className="w-[300px] h-[250px] bg-slate-100 rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center relative shadow-inner">
          {/* Kakao Ad Container */}
          <div
            ref={kakaoContainerRef}
            className={`w-[300px] h-[250px] flex items-center justify-center ${
              adLoaded ? 'block' : 'hidden'
            }`}
          />

          {/* High-quality 300x250 fallback if script is loading or restricted */}
          {!adLoaded && (
            <div
              className="w-full h-full p-4 bg-gradient-to-br from-amber-500 via-orange-500 to-red-600 text-white flex flex-col justify-between cursor-pointer group text-left relative overflow-hidden"
              onClick={() => window.open('https://adfit.kakao.com/', '_blank', 'noopener,noreferrer')}
            >
              <div className="flex items-center justify-between z-10">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-black/30 backdrop-blur-xs">
                  카카오 AdFit
                </span>
                <ExternalLink className="w-4 h-4 opacity-80 group-hover:scale-110 transition-transform" />
              </div>

              <div className="z-10 my-auto">
                <div className="text-3xl mb-1">🎮</div>
                <h3 className="font-extrabold text-base leading-snug">
                  2048 스폰서 맞춤 혜택
                </h3>
                <p className="text-xs opacity-90 mt-1 leading-relaxed">
                  스마트한 모바일 퍼즐과 함께 만나는 특별 할인가 및 리워드!
                </p>
              </div>

              <div className="z-10 pt-2 border-t border-white/20 flex items-center justify-between text-[10px] opacity-80">
                <span>추천 광고</span>
                <span>AD</span>
              </div>

              {/* Background Glow */}
              <div className="absolute -right-12 -bottom-12 w-32 h-32 bg-white/20 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform" />
            </div>
          )}
        </div>

        {/* Action Button to Proceed */}
        <div className="w-full mt-4">
          <button
            onClick={onCloseAndProceed}
            disabled={!canSkip}
            className={`w-full py-2.5 px-4 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 ${
              canSkip
                ? 'bg-amber-600 hover:bg-amber-700 active:scale-95 text-white cursor-pointer shadow-md'
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
