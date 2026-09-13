import React from 'react';
import { TelemetryRecord } from '../../types/dashboard';
import { fmt, formatTime } from '../../utils/formatters';

interface HeroOverviewProps {
  latest: TelemetryRecord | null;
}

export const HeroOverview: React.FC<HeroOverviewProps> = ({ latest }) => {
  const conditionTitle = latest?.condition?.title || 'Menunggu Telemetri Sensor';
  const conditionDesc = latest?.condition?.description || 'Data tanaman akan diperbarui secara otomatis saat ESP32 mempublikasikan telemetri.';
  const priority = latest?.condition?.priority ? `${latest.condition.priority} Priority` : 'Normal Priority';
  const lastUpdate = latest?.timestamp ? `Updated ${formatTime(latest.timestamp)}` : 'No data yet';
  const risk = latest?.sensor_risk ? String(latest.sensor_risk).toUpperCase() : 'UNKNOWN';
  const confidence = latest?.sensor_confidence !== undefined ? `${fmt(latest.sensor_confidence)}% confidence` : null;

  const getRiskBadge = (r: string) => {
    switch (r) {
      case 'HIGH':
        return {
          label: 'HIGH RISK',
          bg: 'bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]',
        };
      case 'MODERATE':
        return {
          label: 'MODERATE RISK',
          bg: 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]',
        };
      case 'LOW':
        return {
          label: 'LOW RISK',
          bg: 'bg-[#E8F5E9] text-[#1B5E20] border-[#C8E6C9]',
        };
      default:
        return {
          label: 'AWAITING DATA',
          bg: 'bg-[#F2F6F4] text-[#5C736B] border-[#E2EAE6]',
        };
    }
  };

  const riskBadge = getRiskBadge(risk);

  return (
    <section
      id="overview"
      className="flora-card-hero p-6 lg:p-7 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
    >
      <div className="max-w-2xl">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8FBEA8] px-2 py-0.5 rounded bg-[#10352B] border border-[#235849]">
            Overall Plant Health Assessment
          </span>
          <span className="text-xs text-[#DCECE5]/80 font-tabular">{lastUpdate}</span>
        </div>

        <h2 className="text-2xl lg:text-3xl font-bold font-display text-white tracking-tight mt-1 mb-2">
          {conditionTitle}
        </h2>

        <p className="text-sm text-[#DCECE5]/90 leading-relaxed max-w-xl">
          {conditionDesc}
        </p>

        <div className="flex items-center gap-2 mt-4 flex-wrap">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#10352B] text-[#DCECE5] border border-[#235849]">
            {priority}
          </span>
          <span className="text-xs text-[#8FBEA8] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8FBEA8]"></span>
            Decision support model active
          </span>
        </div>
      </div>

      {/* Environmental Risk Summary Box */}
      <div className="bg-[#10352B]/90 border border-[#235849] rounded-xl p-5 min-w-[200px] text-center shrink-0 self-stretch md:self-auto flex flex-col items-center justify-center shadow-inner">
        <span className="text-[10px] text-[#8FBEA8] uppercase tracking-wider font-semibold block mb-1">
          Microclimate Risk
        </span>
        <div className={`px-3 py-1 rounded-lg text-sm font-bold border ${riskBadge.bg} my-1 font-display`}>
          {riskBadge.label}
        </div>
        {confidence ? (
          <span className="text-[11px] text-[#8FBEA8] font-tabular mt-1">
            {confidence}
          </span>
        ) : (
          <span className="text-[11px] text-[#8FBEA8]/70 mt-1">
            Model inference
          </span>
        )}
      </div>
    </section>
  );
};
