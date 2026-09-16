import React from 'react';
import { TelemetryRecord } from '../../types/dashboard';
import { evaluateSystemAlert } from '../../utils/sensorRules';

interface InDashboardAlertProps {
  latest: TelemetryRecord | null;
  mqttStatus?: string;
  onNavigate?: (sectionId: string) => void;
}

export const InDashboardAlert: React.FC<InDashboardAlertProps> = ({
  latest,
  mqttStatus,
  onNavigate,
}) => {
  const alertInfo = evaluateSystemAlert(latest, mqttStatus);

  const getStyle = () => {
    switch (alertInfo.severity) {
      case 'CRITICAL':
        return {
          wrapper: 'bg-[#FEEAEA] border-[#FCCECE] text-[#961C1C]',
          dot: 'bg-[#DC2626]',
          badge: 'bg-[#FCCECE] text-[#961C1C]',
          btn: 'bg-[#961C1C] text-white hover:bg-[#7D1515]',
          icon: (
            <svg className="w-4 h-4 shrink-0 text-[#DC2626]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          ),
        };
      case 'WARNING':
        return {
          wrapper: 'bg-[#FEF7E8] border-[#FDE3B5] text-[#8A570C]',
          dot: 'bg-[#D97706]',
          badge: 'bg-[#FDE3B5] text-[#8A570C]',
          btn: 'bg-[#8A570C] text-white hover:bg-[#704508]',
          icon: (
            <svg className="w-4 h-4 shrink-0 text-[#D97706]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          ),
        };
      case 'NORMAL':
        return {
          wrapper: 'bg-[#EAF4E8] border-[#C4E1BF] text-[#22531A]',
          dot: 'bg-[#367C29]',
          badge: 'bg-[#C4E1BF] text-[#22531A]',
          btn: 'bg-[#22531A] text-white hover:bg-[#1A4014]',
          icon: (
            <svg className="w-4 h-4 shrink-0 text-[#367C29]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          ),
        };
      default:
        return {
          wrapper: 'bg-[#F4F7F2] border-[#E4EBE0] text-[#617253]',
          dot: 'bg-[#617253]',
          badge: 'bg-[#E4EBE0] text-[#617253]',
          btn: 'bg-[#617253] text-white hover:bg-[#4E5C43]',
          icon: (
            <svg className="w-4 h-4 shrink-0 text-[#617253]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          ),
        };
    }
  };

  const style = getStyle();

  return (
    <aside
      aria-label="Realtime Plant Status Alert"
      className={`p-3.5 sm:p-4 rounded-xl border transition-all duration-300 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${style.wrapper}`}
    >
      <div className="flex items-start sm:items-center gap-3 min-w-0">
        <div className="mt-0.5 sm:mt-0">{style.icon}</div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-xs sm:text-sm tracking-tight font-display">
              {alertInfo.title}
            </span>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${style.badge}`}>
              {alertInfo.severity}
            </span>
          </div>
          <p className="text-xs opacity-90 mt-0.5 leading-snug">
            {alertInfo.description}
          </p>
        </div>
      </div>

      {alertInfo.actionText && alertInfo.actionTarget && onNavigate && (
        <button
          onClick={() => onNavigate(alertInfo.actionTarget!)}
          className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 self-end sm:self-auto cursor-pointer ${style.btn}`}
        >
          <span>{alertInfo.actionText}</span>
          <span className="text-[11px]">→</span>
        </button>
      )}
    </aside>
  );
};
