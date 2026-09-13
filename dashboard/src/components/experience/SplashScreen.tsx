import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onBootComplete: () => void;
  onSkip: () => void;
}

const BOOT_STAGES = [
  'INITIALIZING FLORA KERNEL',
  'CONNECTING SENSOR NETWORK',
  'ANALYZING MICROCLIMATE ENVIRONMENT',
  'CONNECTING AI VISION PIPELINE',
  'SYSTEM READY',
];

export const SplashScreen: React.FC<SplashScreenProps> = ({ onBootComplete, onSkip }) => {
  const [stageIndex, setStageIndex] = useState(0);
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    const interval = setInterval(() => {
      setStageIndex((prev) => {
        if (prev < BOOT_STAGES.length - 1) {
          return prev + 1;
        }
        return prev;
      });
      setProgress((prev) => Math.min(100, prev + 22));
    }, 450);

    const timer = setTimeout(() => {
      onBootComplete();
    }, 2400);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [onBootComplete]);

  return (
    <div className="fixed inset-0 bg-[#051F20] text-white flex flex-col items-center justify-center z-50 p-6 selection:bg-[#8EB69B]">
      {/* Background organic glow */}
      <div className="absolute w-[500px] h-[500px] bg-[#163832]/50 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center max-w-[440px] w-full text-center">
        {/* Logo icon */}
        <div className="w-[68px] h-[68px] rounded-2xl bg-gradient-to-br from-[#8EB69B] to-[#235347] flex items-center justify-center text-[#051F20] font-black text-[36px] mb-6 shadow-2xl ring-4 ring-[#8EB69B]/20 animate-pulse">
          F
        </div>

        {/* Brand */}
        <h1 className="text-[34px] font-black tracking-[0.16em] text-white m-0 leading-tight">
          FLORA
        </h1>
        <p className="text-[#8EB69B] text-[13px] font-semibold tracking-wider mt-1 mb-8 uppercase">
          Smart Plant Monitoring &amp; AI Vision System
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-[#0B2B26] border border-[#163832] h-2 rounded-full overflow-hidden mb-4 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-[#235347] via-[#8EB69B] to-[#D8EFD8] transition-all duration-300 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Boot stage text */}
        <div className="flex items-center gap-2 text-[#8EB69B] text-[11px] font-mono tracking-wider mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8EB69B] animate-ping" />
          <span>{BOOT_STAGES[stageIndex]}</span>
        </div>

        {/* Skip Button */}
        <button
          onClick={onSkip}
          className="border border-[#163832] bg-[#0B2B26]/80 hover:bg-[#163832] text-[#8EB69B] hover:text-white px-5 py-2 rounded-xl text-[12px] font-semibold tracking-wider transition-all cursor-pointer"
        >
          Skip to Dashboard →
        </button>
      </div>
    </div>
  );
};
