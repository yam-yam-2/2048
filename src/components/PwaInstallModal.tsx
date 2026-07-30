import React from 'react';
import { Download, X, Share, PlusSquare, Smartphone, Check, Sparkles, HelpCircle } from 'lucide-react';

interface PwaInstallModalProps {
  isOpen: boolean;
  canInstallNative: boolean;
  onClose: () => void;
  onInstallClick: () => void;
}

export const PwaInstallModal: React.FC<PwaInstallModalProps> = ({
  isOpen,
  canInstallNative,
  onClose,
  onInstallClick,
}) => {
  if (!isOpen) return null;

  // iOS Safari check
  const isIos =
    typeof navigator !== 'undefined' &&
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !(window as unknown as { MSStream?: unknown }).MSStream;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl p-5 w-full max-w-[380px] flex flex-col text-stone-800 shadow-2xl border border-amber-200/80 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-800 text-amber-100 flex items-center justify-center shadow-md shrink-0 font-extrabold text-xl">
            2048
          </div>
          <div className="flex flex-col text-left">
            <h3 className="font-extrabold text-base text-amber-950 flex items-center gap-1.5">
              <span>2048 앱 설치하기</span>
              <Sparkles className="w-4 h-4 text-amber-500 fill-amber-300" />
            </h3>
            <p className="text-xs text-stone-500 font-medium">홈 화면에 추가하여 더 빠르게 즐기세요</p>
          </div>
        </div>

        {/* Benefits List */}
        <div className="bg-amber-50/80 border border-amber-200/60 rounded-xl p-3 mb-4 text-left space-y-1.5 text-xs text-amber-900 font-medium">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>인터넷 연결 없는 오프라인 환경에서도 플레이 가능</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>주소창 없이 풀스크린 전용 앱으로 쾌적하게 동작</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>용량 부담 없는 경량 PWA 앱</span>
          </div>
        </div>

        {/* Action Button for Native Install Prompt */}
        {canInstallNative ? (
          <div className="space-y-2">
            <button
              onClick={onInstallClick}
              className="w-full py-3 px-4 bg-amber-800 hover:bg-amber-900 active:scale-95 text-amber-50 font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>원클릭 앱 자동 설치</span>
            </button>
            <p className="text-[11px] text-stone-400 text-center">
              버튼 클릭 시 브라우저 설치 창이 열립니다.
            </p>
          </div>
        ) : isIos ? (
          /* iOS Manual Guide */
          <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200 text-left text-xs text-stone-700 space-y-2.5">
            <div className="font-bold text-stone-900 flex items-center gap-1.5 text-xs">
              <Smartphone className="w-4 h-4 text-amber-700" />
              <span>iPhone / iPad Safari 설치 방법</span>
            </div>
            <ol className="space-y-2 text-stone-600 text-[11px] leading-relaxed pl-1">
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-amber-200 text-amber-900 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                <span>하단 메뉴바의 <strong className="text-stone-900 inline-flex items-center gap-0.5 bg-stone-200 px-1 py-0.5 rounded"><Share className="w-3 h-3" /> 공유</strong> 버튼을 누릅니다.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-amber-200 text-amber-900 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                <span>목록을 내리고 <strong className="text-stone-900 inline-flex items-center gap-0.5 bg-stone-200 px-1 py-0.5 rounded"><PlusSquare className="w-3 h-3" /> 홈 화면에 추가</strong>를 선택합니다.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-amber-200 text-amber-900 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                <span>우측 상단 <strong>추가</strong>를 누르면 설치 완료!</span>
              </li>
            </ol>
          </div>
        ) : (
          /* General Android / Chrome Manual Guide */
          <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200 text-left text-xs text-stone-700 space-y-2">
            <div className="font-bold text-stone-900 flex items-center gap-1.5 text-xs">
              <HelpCircle className="w-4 h-4 text-amber-700" />
              <span>브라우저 수동 설치 방법</span>
            </div>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              1. 브라우저 우측 상단 <strong>메뉴 (⋮ 또는 설정)</strong> 아이콘을 누릅니다.<br />
              2. <strong>'앱 설치'</strong> 또는 <strong>'홈 화면에 추가'</strong> 항목을 선택하면 간편하게 설치됩니다!
            </p>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-4 w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-600 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
        >
          닫기
        </button>
      </div>
    </div>
  );
};
