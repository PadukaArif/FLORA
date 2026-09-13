import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-12 py-8 border-t border-[#E2EAE6] text-center text-xs text-[#5C736B]">
      <div className="flex items-center justify-center gap-2 mb-1">
        <span className="font-bold text-[#17332B] font-display">FLORA</span>
        <span>·</span>
        <span>Smart Plant Monitoring &amp; AI Vision System</span>
        <span>·</span>
        <span>v2.0</span>
      </div>
      <p className="text-[11px] text-[#5C736B]/80 max-w-xl mx-auto leading-relaxed m-0">
        Hasil analisis AI dan rekomendasi lingkungan berfungsi sebagai sistem pendukung keputusan (decision support) dan bukan diagnosis penyakit tanaman definitif.
      </p>
    </footer>
  );
};
