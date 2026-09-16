import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-12 py-8 border-t border-[#E4EBE0] text-center text-xs text-[#617253]">
      <div className="flex items-center justify-center gap-2 mb-1.5 flex-wrap">
        <span className="font-bold text-[#1B2408] font-display flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="#597C00">
            <path d="M12 0 C12 7 17 12 24 12 C17 12 12 17 12 24 C12 17 7 12 0 12 C7 12 12 7 12 0 Z" />
          </svg>
          <span>FLORA</span>
        </span>
        <span>·</span>
        <span>Smart Plant Monitoring &amp; Botanical AI Vision</span>
        <span>·</span>
        <span className="text-[#597C00] font-semibold">SMKN 1 Jakarta</span>
      </div>
      <p className="text-[11px] text-[#617253]/80 max-w-xl mx-auto leading-relaxed m-0">
        Hasil analisis model edge dan inferensi optik berfungsi sebagai sistem pendukung keputusan agronomis (decision support) dan bukan diagnosis penyakit tanaman mutlak.
      </p>
    </footer>
  );
};
