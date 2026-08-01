import React, { useState, useEffect } from 'react';
import { ThemeMode } from '../types';

interface AdBannerProps {
  position: 'bottom' | 'mid';
  customTitle?: string;
  theme?: ThemeMode;
}

export const AdBanner: React.FC<AdBannerProps> = ({ position, theme = 'classic' }) => {
  const [refreshKey, setRefreshKey] = useState(0);

  const adUnit = position === 'bottom' ? 'DAN-U9DItSdCuBKgbZIK' : 'DAN-O77EOJHcnDXSBVHx';
  const adWidth = '320';
  const adHeight = position === 'bottom' ? '100' : '50';

  // Auto refresh every 50 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setRefreshKey((prev) => prev + 1);
    }, 50000);
    return () => clearInterval(timer);
  }, []);

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

  const srcDoc = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      display: flex;
      justify-content: center;
      align-items: center;
      background: transparent;
    }
  </style>
</head>
<body>
  <ins class="kakao_ad_area" style="display:none;"
    data-ad-unit="${adUnit}"
    data-ad-width="${adWidth}"
    data-ad-height="${adHeight}"></ins>
  <script type="text/javascript" src="https://t1.kakaocdn.net/kas/static/ba.min.js" async></script>
</body>
</html>`;

  return (
    <div
      id={`ad-unit-${position}`}
      className={`w-full max-w-[420px] mx-auto rounded-xl border shadow-xs transition-all duration-300 overflow-hidden backdrop-blur-sm ${containerStyle} ${
        position === 'bottom' ? 'relative z-40 ring-1 shadow-md my-0' : 'relative my-1'
      }`}
    >
      <div className={`relative p-1 flex justify-center items-center ${position === 'bottom' ? 'min-h-[102px]' : 'min-h-[52px]'}`}>
        <iframe
          key={`${position}-${refreshKey}`}
          srcDoc={srcDoc}
          width={adWidth}
          height={adHeight}
          title={`Kakao AdBanner ${position}`}
          style={{
            border: 'none',
            overflow: 'hidden',
            width: `${adWidth}px`,
            height: `${adHeight}px`,
            backgroundColor: 'transparent',
          }}
          scrolling="no"
        />
      </div>
    </div>
  );
};
