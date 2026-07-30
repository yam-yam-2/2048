import React, { useEffect, useRef } from 'react';
import { ThemeMode } from '../types';

interface AdBannerProps {
  position: 'bottom' | 'mid';
  customTitle?: string;
  theme?: ThemeMode;
}

export const AdBanner: React.FC<AdBannerProps> = ({ position, theme = 'classic' }) => {
  const kakaoContainerRef = useRef<HTMLDivElement>(null);

  const adUnit = position === 'bottom' ? 'DAN-U9DItSdCuBKgbZIK' : 'DAN-O77EOJHcnDXSBVHx';
  const adWidth = '320';
  const adHeight = position === 'bottom' ? '100' : '50';

  useEffect(() => {
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

      kakaoContainerRef.current.appendChild(ins);
      kakaoContainerRef.current.appendChild(script);
    }
  }, [adUnit, adWidth, adHeight]);

  // Theme-aware styles
  const getThemeStyles = (t?: string) => {
    switch (t) {
      case 'dark':
        return 'bg-slate-800/90 border-slate-700 text-slate-100 ring-slate-700/50';
      case 'pastel':
        return 'bg-white/95 border-pink-200 text-pink-950 ring-pink-300/30';
      case 'emerald':
        return 'bg-white/95 border-emerald-200 text-emerald-950 ring-emerald-300/30';
      case 'sunset':
        return 'bg-white/95 border-orange-200 text-orange-950 ring-orange-300/30';
      case 'classic':
      default:
        return 'bg-white/95 border-amber-900/10 text-stone-800 ring-amber-500/20';
    }
  };

  const containerStyle = getThemeStyles(theme);

  return (
    <div
      id={`ad-unit-${position}`}
      className={`w-full max-w-[420px] mx-auto rounded-xl border shadow-xs transition-all duration-300 overflow-hidden backdrop-blur-sm ${containerStyle} ${
        position === 'bottom' ? 'relative z-40 ring-1 shadow-md my-0' : 'relative my-1'
      }`}
    >
      <div className={`relative p-1 flex justify-center items-center ${position === 'bottom' ? 'min-h-[102px]' : 'min-h-[52px]'}`}>
        <div
          ref={kakaoContainerRef}
          className="flex justify-center items-center w-full min-h-[50px]"
        />
      </div>
    </div>
  );
};
