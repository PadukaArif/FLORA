import React from 'react';
import { TelemetryRecord } from '../../types/dashboard';
import { fmt } from '../../utils/formatters';

interface AiVisionPanelProps {
  latest: TelemetryRecord | null;
}

export const AiVisionPanel: React.FC<AiVisionPanelProps> = ({ latest }) => {
  const isConnected = Boolean(latest?.vision_connected);
  const prediction = latest?.vision_prediction || 'Awaiting inference';
  
  const bars = [
    {
      label: 'Healthy Foliage Pattern',
      value: latest?.vision_healthy !== undefined ? Number(latest.vision_healthy) : null,
      color: '#2E7D32',
      bgBar: '#E8F5E9',
    },
    {
      label: 'Powdery Mildew Indication',
      value: latest?.vision_powdery !== undefined ? Number(latest.vision_powdery) : null,
      color: '#EA580C',
      bgBar: '#FFEDD5',
    },
    {
      label: 'Rust Indication',
      value: latest?.vision_rust !== undefined ? Number(latest.vision_rust) : null,
      color: '#9A3412',
      bgBar: '#FDF2E9',
    },
  ];

  return (
    <section className="flora-card p-6 flex flex-col justify-between rounded-2xl bg-white border border-[#E2EAE6] shadow-sm">
      <div>
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-[10px] font-bold text-[#2F6F5E] uppercase tracking-widest block">
              Computer Vision · Edge Classifier
            </span>
            <h2 className="text-base font-bold text-[#17332B] font-display mt-0.5">
              AI Vision Leaf Analysis
            </h2>
          </div>
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${
              isConnected
                ? 'bg-[#E8F5E9] text-[#1B5E20] border-[#C8E6C9]'
                : 'bg-[#F2F6F4] text-[#5C736B] border-[#E2EAE6]'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-[#2E7D32]' : 'bg-[#5C736B]'}`} />
            {isConnected ? 'ESP-NOW Active' : 'ESP-NOW Standby'}
          </span>
        </div>

        {/* Prediction Tag */}
        <div className="bg-[#F2F6F4] border border-[#E2EAE6] rounded-xl p-3.5 mb-4 flex justify-between items-center">
          <div>
            <span className="text-[10px] uppercase font-semibold text-[#5C736B] block">
              Dominant Visual Classification
            </span>
            <span className="text-base font-bold text-[#17332B] font-display capitalize block mt-0.5">
              {prediction}
            </span>
          </div>
          <span className="text-[11px] font-semibold text-[#2F6F5E] bg-white px-2.5 py-1 rounded-lg border border-[#E2EAE6] shadow-xs">
            Edge TFLite
          </span>
        </div>

        {/* Probability Bars */}
        <div className="space-y-3.5 my-3">
          {bars.map((bar) => {
            const hasVal = bar.value !== null && !isNaN(bar.value);
            const valNum = hasVal ? Math.min(100, Math.max(0, bar.value!)) : 0;
            return (
              <div key={bar.label}>
                <div className="flex justify-between text-xs font-semibold text-[#17332B] mb-1.5">
                  <span>{bar.label}</span>
                  <span className="font-tabular text-[#5C736B]">
                    {hasVal ? `${fmt(valNum)}%` : '—%'}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-[#E2EAE6] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${valNum}%`,
                      backgroundColor: bar.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Non-diagnostic disclaimer */}
      <div className="mt-4 pt-3 border-t border-[#E2EAE6]">
        <p className="text-[11px] text-[#5C736B]/80 leading-relaxed m-0">
          Hasil klasifikasi pola visual merupakan indikasi pendukung inspeksi lapangan dan bukan diagnosis penyakit tanaman definitif.
        </p>
      </div>
    </section>
  );
};
