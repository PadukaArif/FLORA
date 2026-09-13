import React from 'react';
import { TelemetryRecord } from '../../types/dashboard';
import { fmt } from '../../utils/formatters';

interface EnvironmentalAiRiskPanelProps {
  latest: TelemetryRecord | null;
}

export const EnvironmentalAiRiskPanel: React.FC<EnvironmentalAiRiskPanelProps> = ({ latest }) => {
  const risk = latest?.sensor_risk ? String(latest.sensor_risk).toUpperCase() : 'UNKNOWN';
  const confidence = latest?.sensor_confidence !== undefined ? fmt(latest.sensor_confidence) : null;

  // Real probabilities from model telemetry (only if provided by backend/device)
  const hasHighProb = latest?.high_probability !== undefined && latest.high_probability !== null;
  const hasModProb = latest?.moderate_probability !== undefined && latest.moderate_probability !== null;
  const hasLowProb = latest?.low_probability !== undefined && latest.low_probability !== null;
  const hasProbabilities = hasHighProb || hasModProb || hasLowProb;

  const getRiskBadge = (r: string) => {
    switch (r) {
      case 'HIGH':
        return {
          label: 'HIGH RISK',
          style: 'bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]',
        };
      case 'MODERATE':
        return {
          label: 'MODERATE RISK',
          style: 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]',
        };
      case 'LOW':
        return {
          label: 'LOW RISK',
          style: 'bg-[#E8F5E9] text-[#1B5E20] border-[#C8E6C9]',
        };
      default:
        return {
          label: 'AWAITING INFERENCE',
          style: 'bg-[#F2F6F4] text-[#5C736B] border-[#E2EAE6]',
        };
    }
  };

  const riskBadge = getRiskBadge(risk);
  const factors = latest?.condition?.factors || [];

  return (
    <section className="flora-card p-6 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-[11px] font-semibold text-[#2F6F5E] uppercase tracking-wider block">
              Machine Learning Model
            </span>
            <h2 className="text-base font-bold text-[#17332B] font-display">
              Environmental Risk Analysis
            </h2>
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${riskBadge.style}`}>
            {riskBadge.label}
          </span>
        </div>

        {/* Model Probabilities Distribution (Real data only) */}
        {hasProbabilities ? (
          <div className="grid grid-cols-3 gap-2.5 my-3">
            <div className="bg-[#F2F6F4] p-3 rounded-xl border border-[#E2EAE6]">
              <span className="text-[10px] font-semibold text-[#5C736B] uppercase block">
                High Risk
              </span>
              <span className="text-lg font-bold font-tabular text-[#991B1B] block mt-0.5">
                {hasHighProb ? `${fmt(latest!.high_probability)}%` : '—'}
              </span>
            </div>
            <div className="bg-[#F2F6F4] p-3 rounded-xl border border-[#E2EAE6]">
              <span className="text-[10px] font-semibold text-[#5C736B] uppercase block">
                Moderate Risk
              </span>
              <span className="text-lg font-bold font-tabular text-[#92400E] block mt-0.5">
                {hasModProb ? `${fmt(latest!.moderate_probability)}%` : '—'}
              </span>
            </div>
            <div className="bg-[#F2F6F4] p-3 rounded-xl border border-[#E2EAE6]">
              <span className="text-[10px] font-semibold text-[#5C736B] uppercase block">
                Low Risk
              </span>
              <span className="text-lg font-bold font-tabular text-[#1B5E20] block mt-0.5">
                {hasLowProb ? `${fmt(latest!.low_probability)}%` : '—'}
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-[#F2F6F4] border border-[#E2EAE6] rounded-xl p-3.5 my-3 text-xs text-[#5C736B] flex items-center justify-between">
            <span>Probability breakdown</span>
            <span className="font-medium text-[#17332B]">
              {confidence ? `Classification Confidence: ${confidence}%` : 'Single-class inference output'}
            </span>
          </div>
        )}

        {/* Dynamic Context Factors (Why this result?) */}
        <div className="mt-4 pt-3.5 border-t border-[#E2EAE6]">
          <h3 className="text-xs font-bold text-[#17332B] mb-2 flex items-center gap-1.5 font-display">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2F6F5E]"></span>
            Sensor Context &amp; Contributing Factors
          </h3>

          {factors.length > 0 ? (
            <ul className="text-xs text-[#5C736B] space-y-1.5 pl-4 list-disc">
              {factors.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          ) : latest ? (
            <p className="text-xs text-[#5C736B] leading-relaxed">
              Analisis risiko diturunkan dari pembacaan sensor suhu ({fmt(latest.temperature)}°C), kelembapan ({fmt(latest.humidity)}%), dan kadar air tanah ({fmt(latest.soil_moisture)}%) saat ini.
            </p>
          ) : (
            <p className="text-xs text-[#5C736B]">
              Menunggu pembacaan data sensor dari ESP32.
            </p>
          )}
        </div>
      </div>

      {/* Scientific Disclaimer */}
      <div className="mt-4 pt-3 border-t border-[#E2EAE6]">
        <p className="text-[11px] text-[#5C736B]/80 leading-relaxed m-0">
          Model mikroklimat on-device mengevaluasi kesesuaian lingkungan tanaman sebagai sistem pendukung keputusan.
        </p>
      </div>
    </section>
  );
};
