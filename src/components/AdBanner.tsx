import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ExternalLink, ShieldCheck } from 'lucide-react';
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

  const loadKakaoAd = useCallback(() => {
    if (kakaoContainerRef.current) {
      kakaoContainerRef.current.innerHTML = '';

      const ins = document.createElement('ins');
      ins.className = 'kakao_ad_area';
      ins.style.display = 'none';
      ins.setAttribute('data-ad-unit', 'DAN-qOl4hJHrBY8KsZQF');
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
  }, []);

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
          ? 'sticky bottom-1 z-40 ring-1 shadow-md my-1'
          : 'relative my-2'
      }`}
    >
      {/* Clean Top Header bar aligned with theme */}
      <div className={`flex items-center justify-between px-2.5 py-1 border-b text-[10px] sm:text-[11px] font-medium transition-colors duration-300 ${themeStyle.headerBg}`}>
        <div className="flex items-center gap-1.5 truncate">
          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-bold text-[9px] sm:text-[10px] tracking-wide uppercase shrink-0 ${themeStyle.badgeBg}`}>
            {customTitle || '스폰서 광고'}
          </span>
        </div>
        <span className={`inline-flex items-center gap-1 text-[10px] shrink-0 ${themeStyle.shieldText}`}>
          <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" />
          안전 검증
        </span>
      </div>

      {/* Main Ad Area */}
      <div className="relative p-2 min-h-[92px] flex flex-col justify-center items-center">
        {/* Dynamic Kakao AdFit Container */}
        <div
          ref={kakaoContainerRef}
          className={`flex justify-center items-center w-full min-h-[90px] ${
            adFitLoaded ? 'block' : 'hidden'
          }`}
        />

        {/* Fallback / simulated ad card */}
        {!adFitLoaded && (
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
