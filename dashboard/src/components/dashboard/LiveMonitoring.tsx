import React from 'react';
import { TelemetryRecord, ThresholdConfig } from '../../types/dashboard';
import { formatTime } from '../../utils/formatters';
import {
  interpretTemperature,
  interpretHumidity,
  interpretSoil,
  MetricInterpretation,
} from '../../utils/sensorRules';

interface LiveMonitoringProps {
  latest: TelemetryRecord | null;
  config?: Partial<ThresholdConfig>;
}

interface SensorCardProps {
  title: string;
  icon: React.ReactNode;
  metric: MetricInterpretation;
  updatedText: string;
}

const SensorCard: React.FC<SensorCardProps> = ({ title, icon, metric, updatedText }) => {
  return (
    <article className="flora-card p-5 lg:p-6 flex flex-col justify-between transition-all duration-200 hover:border-[#8FBEA8] hover:shadow-md bg-white rounded-2xl border border-[#E2EAE6]">
      <div>
        {/* Header with Semantic Icon & Status Badge */}
        <div className="flex justify-between items-center mb-3.5">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-[#F2F6F4] text-[#2F6F5E] flex items-center justify-center font-bold border border-[#E2EAE6] shrink-0 shadow-sm">
              {icon}
            </span>
            <span className="text-[11px] font-bold text-[#5C736B] uppercase tracking-wider">
              {title}
            </span>
          </div>

          <span
            className="text-[11px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1.5 shadow-xs uppercase tracking-wide"
            style={{
              backgroundColor: metric.statusColor.bg,
              color: metric.statusColor.text,
              borderColor: metric.statusColor.border,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: metric.statusColor.dot }}
            />
            {metric.statusLabel}
          </span>
        </div>

        {/* Large Value & Unit */}
        <div className="my-2.5 flex items-baseline gap-1.5">
          <span className="text-3xl lg:text-4xl font-bold font-tabular text-[#17332B] tracking-tight">
            {metric.valueFormatted}
          </span>
          <span className="text-base font-semibold text-[#5C736B] font-display">
            {metric.unit}
          </span>
        </div>

        {/* Short Agronomic Interpretation */}
        <p className="text-xs text-[#5C736B] leading-relaxed my-2 min-h-[38px]">
          {metric.explanation}
        </p>
      </div>

      {/* Reference / Target Range & Timestamp */}
      <div className="pt-3.5 border-t border-[#E2EAE6] flex justify-between items-center text-[11px] gap-2 flex-wrap">
        <span className="font-semibold text-[#2F6F5E] bg-[#F2F6F4] px-2.5 py-1 rounded-lg border border-[#E2EAE6] text-[11px]">
          {metric.reference}
        </span>
        <span className="font-tabular text-[10px] text-[#5C736B]">
          {updatedText}
        </span>
      </div>
    </article>
  );
};

export const LiveMonitoring: React.FC<LiveMonitoringProps> = ({ latest, config }) => {
  const updatedText = latest?.timestamp ? `Updated ${formatTime(latest.timestamp)}` : 'Waiting data';

  const tempMetric = interpretTemperature(latest?.temperature, config);
  const humMetric = interpretHumidity(latest?.humidity, config);
  const soilMetric = interpretSoil(latest?.soil_moisture, config);

  return (
    <section id="monitoring" className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <div>
          <span className="text-[11px] font-semibold text-[#2F6F5E] uppercase tracking-wider block">
            Telemetry Feed
          </span>
          <h2 className="text-lg font-bold text-[#17332B] tracking-tight font-display">
            Live Environmental Sensors
          </h2>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E8F5E9] border border-[#C8E6C9] text-xs font-semibold text-[#1B5E20]">
          <span className="w-2 h-2 rounded-full bg-[#2E7D32] animate-pulse" />
          <span>Live Feed</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5">
        <SensorCard
          title="Temperature"
          icon={
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
            </svg>
          }
          metric={tempMetric}
          updatedText={updatedText}
        />
        <SensorCard
          title="Air Humidity"
          icon={
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
            </svg>
          }
          metric={humMetric}
          updatedText={updatedText}
        />
        <SensorCard
          title="Soil Moisture"
          icon={
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22v-9" />
              <path d="M9 10a3 3 0 0 1 6 0c0 2-3 5-3 5s-3-3-3-5z" />
              <path d="M4 19a8 8 0 0 1 16 0" />
            </svg>
          }
          metric={soilMetric}
          updatedText={updatedText}
        />
      </div>
    </section>
  );
};
