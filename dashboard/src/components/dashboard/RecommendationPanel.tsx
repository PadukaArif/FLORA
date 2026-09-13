import React from 'react';
import { TelemetryRecord } from '../../types/dashboard';
import { generateFloraInsight } from '../../utils/sensorRules';

interface RecommendationPanelProps {
  latest: TelemetryRecord | null;
}

export const RecommendationPanel: React.FC<RecommendationPanelProps> = ({ latest }) => {
  const insight = generateFloraInsight(latest);
  const condition = latest?.condition;
  const actions = condition?.actions || [];
  const factors = condition?.factors || [];

  const getPriorityBadge = (p: string) => {
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
    <section id="treatment" className="flora-card p-6 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <span className="text-[11px] font-semibold text-[#2F6F5E] uppercase tracking-wider block">
              Decision Support &amp; Agronomic Advice
            </span>
            <h2 className="text-base font-bold text-[#17332B] font-display">
              FLORA Insight &amp; Treatment Guidance
            </h2>
          </div>
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getPriorityBadge(
              insight.priority
            )}`}
          >
            {insight.priority} Priority
          </span>
        </div>

        {/* Combined FLORA Insight Banner */}
        <div className="bg-[#F2F6F4] border border-[#E2EAE6] rounded-xl p-4 my-3">
          <span className="text-[10px] font-bold text-[#2F6F5E] uppercase tracking-wider block mb-1">
            Integrated Agronomic Insight
          </span>
          <h3 className="text-sm font-bold text-[#17332B] mb-1 font-display">
            {insight.headline}
          </h3>
          <p className="text-xs text-[#5C736B] leading-relaxed m-0">
            {insight.summary}
          </p>
        </div>

        {/* Actionable Recommendations */}
        <div className="my-3">
          <span className="text-xs font-bold text-[#17332B] block mb-2 font-display">
            Recommended Action Checklist:
          </span>
          {actions.length > 0 ? (
            <ul className="text-xs text-[#17332B] space-y-1.5 pl-4 list-disc font-medium">
              {actions.map((act, index) => (
                <li key={index}>{act}</li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-[#5C736B]">
              {insight.actionGuidance}
            </p>
          )}
        </div>

        {/* Possible Contributing Factors (Collapsible) */}
        {factors.length > 0 && (
          <details className="border-t border-[#E2EAE6] pt-3 mt-3 text-xs text-[#5C736B] cursor-pointer group">
            <summary className="font-semibold text-[#17332B] hover:text-[#2F6F5E] transition-colors py-0.5 select-none">
              Possible environmental factors (Click to inspect)
            </summary>
            <ul className="pl-4 mt-2 space-y-1 text-xs list-disc">
              {factors.map((fac, index) => (
                <li key={index}>{fac}</li>
              ))}
            </ul>
          </details>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-[#E2EAE6]">
        <p className="text-[11px] text-[#5C736B]/80 leading-relaxed m-0">
          Rekomendasi bersifat panduan pendukung keputusan budidaya dan disesuaikan dengan pengamatan lapangan aktual.
        </p>
      </div>
    </section>
  );
};
