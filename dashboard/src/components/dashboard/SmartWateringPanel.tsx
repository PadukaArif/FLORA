import React, { useState } from 'react';
import { TelemetryRecord } from '../../types/dashboard';
import { formatTime } from '../../utils/formatters';

interface SmartWateringPanelProps {
  latest: TelemetryRecord | null;
  onWatered: () => Promise<void>;
}

export const SmartWateringPanel: React.FC<SmartWateringPanelProps> = ({ latest, onWatered }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const wateringStatus = latest?.watering_status
    ? latest.watering_status.replace(/_/g, ' ')
    : 'Awaiting Assessment';
  const wateringPriority = latest?.watering_priority || 'LOW';
  const wateringDesc =
    latest?.watering_description ||
    'Data telemetri kelembapan tanah sedang dianalisis berdasarkan ambang batas konfigurasi.';
  const drySince = formatTime(latest?.dry_since);
  const dryDuration = `${latest?.dry_duration_minutes || 0} min`;
  const nextCheck = formatTime(latest?.next_check_time);

  const handleWaterClick = async () => {
    try {
      setIsSubmitting(true);
      await onWatered();
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityStyle = (p: string) => {
    switch (p) {
      case 'HIGH':
        return 'bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]';
      case 'MEDIUM':
        return 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]';
      default:
        return 'bg-[#E8F5E9] text-[#1B5E20] border-[#C8E6C9]';
    }
  };

  return (
    <section className="flora-card p-6 flex flex-col justify-between rounded-2xl bg-white border border-[#E2EAE6] shadow-sm">
      <div>
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <span className="text-[11px] font-semibold text-[#2F6F5E] uppercase tracking-wider block">
              Irrigation Management
            </span>
            <h2 className="text-base font-bold text-[#17332B] font-display capitalize">
              {wateringStatus}
            </h2>
          </div>
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getPriorityStyle(
              wateringPriority
            )}`}
          >
            {wateringPriority} Priority
          </span>
        </div>

        <p className="text-xs text-[#5C736B] my-3 leading-relaxed">
          {wateringDesc}
        </p>

        {/* Telemetry Metrics Grid */}
        <dl className="grid grid-cols-3 gap-3 border-y border-[#E2EAE6] py-3.5 my-3.5 bg-[#F2F6F4]/50 rounded-lg p-2.5">
          <div>
            <dt className="text-[10px] text-[#5C736B] uppercase font-semibold">Dry Since</dt>
            <dd className="m-0 mt-0.5 font-bold font-tabular text-xs text-[#17332B]">
              {drySince}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] text-[#5C736B] uppercase font-semibold">Duration</dt>
            <dd className="m-0 mt-0.5 font-bold font-tabular text-xs text-[#17332B]">
              {dryDuration}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] text-[#5C736B] uppercase font-semibold">Next Check</dt>
            <dd className="m-0 mt-0.5 font-bold font-tabular text-xs text-[#17332B]">
              {nextCheck}
            </dd>
          </div>
        </dl>
      </div>

      <button
        onClick={handleWaterClick}
        disabled={isSubmitting}
        className="w-full mt-2 py-2.5 px-4 rounded-xl bg-[#2F6F5E] hover:bg-[#17483B] text-white font-semibold text-xs transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <span>💧</span>
        <span>{isSubmitting ? 'Recording Event...' : 'Record Manual Irrigation'}</span>
      </button>
    </section>
  );
};
