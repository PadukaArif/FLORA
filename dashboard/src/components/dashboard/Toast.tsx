import React from 'react';

interface ToastProps {
  message: string;
  visible: boolean;
}

export const Toast: React.FC<ToastProps> = ({ message, visible }) => {
  return (
    <div
      className={`fixed right-6 bottom-6 bg-[#17483B] text-[#DCECE5] border border-[#235849] px-4 py-3 rounded-xl text-xs font-semibold shadow-xl transition-all duration-300 ease-out z-50 pointer-events-none flex items-center gap-2.5 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}
    >
      <span className="w-2 h-2 rounded-full bg-[#8FBEA8] animate-pulse" />
      <span>{message}</span>
    </div>
  );
};
