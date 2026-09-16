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
    'Data telemetri kelembapan tanah dianalisis berdasarkan ambang batas konfigurasi hidrasi.';
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
        return 'bg-[#FEEAEA] text-[#961C1C] border-[#FCCECE]';
      case 'MEDIUM':
        return 'bg-[#FEF7E8] text-[#8A570C] border-[#FDE3B5]';
      default:
        return 'bg-[#EAF4E8] text-[#22531A] border-[#C4E1BF]';
    }
  };

  return (
    <section className="flora-card p-6 flex flex-col justify-between shadow-xs">
      <div>
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <span className="text-[10px] font-bold text-[#597C00] uppercase tracking-widest block">
              Irrigation Management
            </span>
            <h2 className="text-base font-bold text-[#1B2408] font-display capitalize">
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

        <p className="text-xs text-[#617253] my-3 leading-relaxed">
          {wateringDesc}
        </p>

        {/* Telemetry Metrics Grid */}
        <dl className="grid grid-cols-3 gap-3 border-y border-[#E4EBE0] py-3.5 my-3.5 bg-[#F4F7F2]/60 rounded-xl p-3">
          <div>
            <dt className="text-[10px] text-[#617253] uppercase font-bold tracking-wider">Dry Since</dt>
            <dd className="m-0 mt-1 font-bold font-tabular text-xs text-[#1B2408]">
              {drySince}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] text-[#617253] uppercase font-bold tracking-wider">Duration</dt>
            <dd className="m-0 mt-1 font-bold font-tabular text-xs text-[#1B2408]">
              {dryDuration}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] text-[#617253] uppercase font-bold tracking-wider">Next Check</dt>
            <dd className="m-0 mt-1 font-bold font-tabular text-xs text-[#1B2408]">
              {nextCheck}
            </dd>
          </div>
        </dl>
      </div>

      <button
        onClick={handleWaterClick}
        disabled={isSubmitting}
        className="w-full mt-2 py-3 px-4 rounded-xl bg-[#597C00] hover:bg-[#486500] text-white font-semibold text-xs transition-all shadow-xs disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
      >
        <span>💧</span>
        <span>{isSubmitting ? 'Recording Event...' : 'Record Manual Irrigation Event'}</span>
      </button>
    </section>
  );
};
