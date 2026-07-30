import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ExternalLink } from 'lucide-react';
import { SAMPLE_ADS } from '../data/ads';
import { ThemeMode } from '../types';

interface AdBannerProps {
  position: 'bottom' | 'mid';
  customTitle?: string;
  theme?: ThemeMode;
}

export const AdBanner: React.FC<AdBannerProps> = ({ position, customTitle, theme = 'classic' }) => {
  const [adIndex, setAdIndex] = useState<number>(position === 'mid' ? 1 : 0);
  const [adFitLoaded, setAdFitLoaded] = useState<boolean>(false);
  const kakaoContainerRef = useRef<HTMLDivElement>(null);

  const adUnit = position === 'bottom' ? 'DAN-U9DItSdCuBKgbZIK' : 'DAN-O77EOJHcnDXSBVHx';
  const adWidth = '320';
  const adHeight = position === 'bottom' ? '100' : '50';

  const loadKakaoAd = useCallback(() => {
    if (kakaoContainerRef.current) {
      kakaoContainerRef.current.innerHTML = '';

      const ins = document.createElement('ins');
      ins.className = 'kakao_ad_area';
      ins.style.display = 'none';
      ins.setAttribute('data-ad-unit', adUnit);
      ins.setAttribute('data-ad-width', adWidth);
      ins.setAttribute('data-ad-height', adHeight);

      const script = document.createElement('script');
      script.src = 'https://t1.kakaocdn.net/kas/static/ba.min.js';
      script.async = true;
      script.onload = () => setAdFitLoaded(true);
      script.onerror = () => setAdFitLoaded(false);

      kakaoContainerRef.current.appendChild(ins);
      kakaoContainerRef.current.appendChild(script);
    }
  }, [adUnit, adWidth, adHeight]);

  useEffect(() => {
    loadKakaoAd();

    // Rotate fallback ad every 50 seconds (50,000 ms)
    const interval = setInterval(() => {
      setAdIndex((prev) => (prev + 1) % SAMPLE_ADS.length);
    }, 50000);

    return () => clearInterval(interval);
  }, [loadKakaoAd]);

  const currentAd = SAMPLE_ADS[adIndex];

  // Theme-aware styles for the sponsor banner
  const getThemeStyles = (t?: string) => {
    switch (t) {
      case 'dark':
        return {
          container: 'bg-slate-800/90 border-slate-700 text-slate-100 ring-slate-700/50',
          headerBg: 'bg-slate-700/80 border-slate-600/50 text-slate-200',
          badgeBg: 'bg-indigo-600 text-white',
          shieldText: 'text-slate-300',
        };
      case 'pastel':
        return {
          container: 'bg-white/95 border-pink-200 text-pink-950 ring-pink-300/30',
          headerBg: 'bg-pink-100/80 border-pink-200/50 text-pink-950',
          badgeBg: 'bg-pink-600 text-white',
          shieldText: 'text-pink-800',
        };
      case 'emerald':
        return {
          container: 'bg-white/95 border-emerald-200 text-emerald-950 ring-emerald-300/30',
          headerBg: 'bg-emerald-100/80 border-emerald-200/50 text-emerald-950',
          badgeBg: 'bg-emerald-700 text-white',
          shieldText: 'text-emerald-800',
        };
      case 'sunset':
        return {
          container: 'bg-white/95 border-orange-200 text-orange-950 ring-orange-300/30',
          headerBg: 'bg-orange-100/80 border-orange-200/50 text-orange-950',
          badgeBg: 'bg-orange-700 text-white',
          shieldText: 'text-orange-900',
        };
      case 'classic':
      default:
        return {
          container: 'bg-white/95 border-amber-900/10 text-stone-800 ring-amber-500/20',
          headerBg: 'bg-amber-100/70 border-amber-200/40 text-amber-900',
          badgeBg: 'bg-amber-800 text-amber-100',
          shieldText: 'text-amber-800/80',
        };
    }
  };

  const themeStyle = getThemeStyles(theme || 'classic');

  return (
    <div
      id={`ad-unit-${position}`}
      className={`w-full max-w-[420px] mx-auto rounded-xl border shadow-xs transition-all duration-300 overflow-hidden backdrop-blur-sm ${themeStyle.container} ${
        position === 'bottom'
          ? 'relative z-40 ring-1 shadow-md my-0'
          : 'relative my-1'
      }`}
    >
      {/* Main Ad Area */}
      <div className={`relative p-1 flex flex-col justify-center items-center ${position === 'bottom' ? 'min-h-[100px]' : 'min-h-[50px]'}`}>
        {/* Dynamic Kakao AdFit Container */}
        <div
          ref={kakaoContainerRef}
          className={`flex justify-center items-center w-full ${
            adHeight === '100' ? 'min-h-[100px]' : 'min-h-[50px]'
          } ${adFitLoaded ? 'block' : 'hidden'}`}
        />

        {/* Fallback / simulated ad card */}
        {!adFitLoaded && (
          <div
            className={`w-full rounded-lg p-2 bg-gradient-to-r ${currentAd.bgGradient} ${currentAd.textColor} transition-all duration-300 relative overflow-hidden flex items-center justify-between group cursor-pointer shadow-2xs hover:shadow-xs gap-2`}
            onClick={() => window.open(currentAd.linkUrl, '_blank', 'noopener,noreferrer')}
          >
            <div className="flex items-center gap-2 z-10 min-w-0 flex-1">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center text-lg shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                {currentAd.imageIcon}
              </div>
              <div className="flex flex-col text-left min-w-0 flex-1">
                <div className="flex items-center gap-1 truncate">
                  <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-black/30 backdrop-blur-xs tracking-wide shrink-0">
                    AD
                  </span>
                  <span className="text-[10px] opacity-80 truncate">{currentAd.sponsor}</span>
                </div>
                <h4 className="font-bold text-xs leading-tight truncate mt-0.5">{currentAd.title}</h4>
                {position === 'bottom' && (
                  <p className="text-[10px] opacity-90 truncate leading-tight mt-0.5">{currentAd.description}</p>
                )}
              </div>
            </div>

            <div className="z-10 flex flex-col items-end justify-center self-stretch shrink-0">
              <span className="p-1 rounded-full bg-white/20 group-hover:bg-white/30 text-current transition-colors">
                <ExternalLink className="w-3 h-3" />
              </span>
            </div>

            <div className="absolute -right-8 -bottom-8 w-20 h-20 bg-white/10 rounded-full blur-lg pointer-events-none group-hover:scale-150 transition-transform" />
          </div>
        )}
      </div>
    </div>
  );
};
