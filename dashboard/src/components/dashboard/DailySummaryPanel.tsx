import React from 'react';
import { DashboardSummary } from '../../types/dashboard';
import { fmt } from '../../utils/formatters';

interface DailySummaryPanelProps {
  summary?: DashboardSummary;
}

export const DailySummaryPanel: React.FC<DailySummaryPanelProps> = ({ summary }) => {
  const avgTemp =
    summary?.temperature?.average !== undefined ? `${fmt(summary.temperature.average)}°C` : '—°C';
  const avgHum =
    summary?.humidity?.average !== undefined ? `${fmt(summary.humidity.average)}%` : '—%';
  const avgSoil =
    summary?.soil?.average !== undefined ? `${fmt(summary.soil.average)}%` : '—%';
  const dominantVision = summary?.vision?.dominant || '—';
  const envRisk = summary?.environmental?.dominant
    ? String(summary.environmental.dominant).toUpperCase()
    : '—';
  const dryEvents = summary?.watering?.dry_events ?? 0;

  const items = [
    { label: '24h Avg Temperature', value: avgTemp },
    { label: '24h Avg Humidity', value: avgHum },
    { label: '24h Avg Soil Moisture', value: avgSoil },
    { label: 'Dominant Vision', value: dominantVision },
    { label: 'Dominant Risk Level', value: envRisk },
    { label: 'Dry Reading Events', value: String(dryEvents) },
  ];

  return (
    <section className="flora-card p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-[11px] font-semibold text-[#2F6F5E] uppercase tracking-wider block">
            Statistical Aggregation
          </span>
          <h2 className="text-base font-bold text-[#17332B] font-display">
            24-Hour Signal Summary
          </h2>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#F2F6F4] text-[#5C736B] border border-[#E2EAE6]">
          {summary?.readings ? `${summary.readings} Telemetry Points` : 'Daily Rollup'}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {items.map((item) => (
          <div key={item.label} className="bg-[#F2F6F4] border border-[#E2EAE6] p-3 rounded-xl">
            <span className="text-[10px] font-semibold text-[#5C736B] uppercase tracking-wider block">
              {item.label}
            </span>
            <span className="text-sm font-bold font-tabular text-[#17332B] block mt-1">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};
