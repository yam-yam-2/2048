import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = '예',
  cancelText = '아니오',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl p-6 w-full max-w-xs text-center shadow-xl border border-amber-100">
        <h3 className="text-lg font-bold text-[#776E65] mb-2">{title}</h3>
        <p className="text-xs text-[#776E65]/80 whitespace-pre-line mb-6 leading-relaxed">{message}</p>

        <div className="flex gap-2 justify-center">
          <button
            onClick={onCancel}
            className="flex-1 py-2 px-3 rounded-xl border border-gray-300 text-gray-700 font-bold text-xs hover:bg-gray-100 transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 px-3 rounded-xl bg-[#EDC22E] hover:bg-amber-500 text-white font-bold text-xs shadow-sm transition-transform active:scale-95 cursor-pointer"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
