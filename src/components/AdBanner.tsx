import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RefreshCw, ExternalLink, Sparkles, Clock, ShieldCheck } from 'lucide-react';
import { SAMPLE_ADS } from '../data/ads';
import { sounds } from '../utils/sound';

interface AdBannerProps {
  position: 'bottom' | 'mid';
  customTitle?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({ position, customTitle }) => {
  const [adIndex, setAdIndex] = useState<number>(position === 'mid' ? 1 : 0);
  const [timeLeft, setTimeLeft] = useState<number>(50);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [useKakaoScript, setUseKakaoScript] = useState<boolean>(true);
  const [adFitLoaded, setAdFitLoaded] = useState<boolean>(false);
  const kakaoContainerRef = useRef<HTMLDivElement>(null);

  const refreshAd = useCallback(() => {
    setIsRefreshing(true);
    sounds.playAdRefresh();

    // Rotate ad index for fallback/simulator
    setAdIndex((prev) => (prev + 1) % SAMPLE_ADS.length);
    setTimeLeft(50);

    // Kakao AdFit script re-injection logic
    if (kakaoContainerRef.current) {
      kakaoContainerRef.current.innerHTML = '';

      const ins = document.createElement('ins');
      ins.className = 'kakao_ad_area';
      ins.style.display = 'none';
      ins.setAttribute('data-ad-unit', position === 'mid' ? 'DAN-qOl4hJHrBY8KsZQF' : 'DAN-qOl4hJHrBY8KsZQF');
      ins.setAttribute('data-ad-width', '320');
      ins.setAttribute('data-ad-height', '100');

      const script = document.createElement('script');
      script.src = 'https://t1.kakaocdn.net/kas/static/ba.min.js';
      script.async = true;
      script.onload = () => setAdFitLoaded(true);
      script.onerror = () => setAdFitLoaded(false);

      kakaoContainerRef.current.appendChild(ins);
      kakaoContainerRef.current.appendChild(script);
    }

    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  }, [position]);

  // 50-second auto-refresh timer
  useEffect(() => {
    refreshAd();

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          refreshAd();
          return 50;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [refreshAd]);

  const currentAd = SAMPLE_ADS[adIndex];
  const progressPercent = ((50 - timeLeft) / 50) * 100;

  return (
    <div
      id={`ad-unit-${position}`}
      className={`w-full max-w-[420px] mx-auto rounded-xl border border-amber-900/10 shadow-xs transition-all duration-300 overflow-hidden bg-white/95 backdrop-blur-sm ${
        position === 'bottom'
          ? 'sticky bottom-1 z-40 ring-1 ring-amber-500/20 shadow-md my-1'
          : 'relative border-dashed border-amber-600/30 my-2'
      }`}
    >
      {/* Top Header bar with 50s countdown timer */}
      <div className="flex items-center justify-between px-2.5 py-1 bg-amber-100/80 border-b border-amber-200/50 text-[10px] sm:text-[11px] font-medium text-amber-900 gap-1">
        <div className="flex items-center gap-1.5 truncate">
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-800 text-amber-100 font-bold text-[9px] sm:text-[10px] tracking-wide uppercase shrink-0">
            {position === 'bottom' ? '광고' : customTitle || '광고'}
          </span>
          <span className="text-amber-800/80 hidden xs:inline-flex items-center gap-1 text-[10px] shrink-0">
            <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
            안전 검증
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Countdown indicator */}
          <div className="flex items-center gap-1 bg-amber-200/70 text-amber-950 px-2 py-0.5 rounded-full font-mono text-[10px]">
            <Clock className={`w-3 h-3 text-amber-800 ${timeLeft <= 5 ? 'animate-bounce text-red-600' : ''}`} />
            <span>
              <strong className={timeLeft <= 5 ? 'text-red-600 font-bold' : ''}>{timeLeft}</strong>s
            </span>
          </div>

          <button
            onClick={refreshAd}
            title="광고 수동 새로고침"
            className="p-1 hover:bg-amber-200/90 active:scale-95 rounded text-amber-900 transition-all flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-amber-700' : ''}`} />
          </button>
        </div>
      </div>

      {/* Progress Bar for 50-second refresh countdown */}
      <div className="w-full bg-amber-100 h-1 overflow-hidden">
        <div
          className="bg-amber-500 h-full transition-all duration-1000 ease-linear"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Main Ad Banner Area */}
      <div className="relative p-2 min-h-[92px] flex flex-col justify-center items-center">
        {/* Dynamic Kakao AdFit Container */}
        <div
          ref={kakaoContainerRef}
          className={`flex justify-center items-center w-full min-h-[90px] ${
            useKakaoScript && adFitLoaded ? 'block' : 'hidden'
          }`}
        />

        {/* Fallback / simulated ad card */}
        {(!useKakaoScript || !adFitLoaded) && (
          <div
            className={`w-full rounded-lg p-2.5 bg-gradient-to-r ${currentAd.bgGradient} ${currentAd.textColor} transition-all duration-300 relative overflow-hidden flex items-center justify-between group cursor-pointer shadow-2xs hover:shadow-xs gap-2`}
            onClick={() => window.open(currentAd.linkUrl, '_blank', 'noopener,noreferrer')}
          >
            <div className="flex items-center gap-2.5 z-10 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                {currentAd.imageIcon}
              </div>
              <div className="flex flex-col text-left min-w-0 flex-1">
                <div className="flex items-center gap-1 truncate">
                  <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-black/30 backdrop-blur-xs tracking-wide shrink-0">
                    {currentAd.badge}
                  </span>
                  <span className="text-[10px] opacity-80 truncate">{currentAd.sponsor}</span>
                </div>
                <h4 className="font-bold text-xs sm:text-sm leading-tight truncate mt-0.5">{currentAd.title}</h4>
                <p className="text-[10px] opacity-90 truncate leading-tight mt-0.5">{currentAd.description}</p>
              </div>
            </div>

            <div className="z-10 flex flex-col items-end justify-between self-stretch shrink-0 gap-1">
              <span className="p-1 rounded-full bg-white/20 group-hover:bg-white/30 text-current transition-colors">
                <ExternalLink className="w-3 h-3" />
              </span>
              <span className="text-[8px] opacity-75 font-mono">50s 갱신</span>
            </div>

            {/* Background subtle shine animation */}
            <div className="absolute -right-8 -bottom-8 w-20 h-20 bg-white/10 rounded-full blur-lg pointer-events-none group-hover:scale-150 transition-transform" />
          </div>
        )}
      </div>

      {/* Footer controls inside ad frame */}
      <div className="flex items-center justify-between px-2.5 py-1 bg-amber-50/60 text-[9px] sm:text-[10px] text-amber-900/70 border-t border-amber-100/60">
        <span className="flex items-center gap-1 truncate">
          <Sparkles className="w-3 h-3 text-amber-600 shrink-0" />
          <span className="truncate">50초 자동 새로고침 적용 중</span>
        </span>
        <button
          onClick={() => setUseKakaoScript(!useKakaoScript)}
          className="hover:underline text-amber-900 font-medium shrink-0 ml-2 cursor-pointer"
        >
          {useKakaoScript ? '시뮬레이터 모드' : '카카오 태그'}
        </button>
      </div>
    </div>
  );
};
