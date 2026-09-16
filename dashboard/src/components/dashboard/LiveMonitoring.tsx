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
    <article className="flora-card p-5 lg:p-6 flex flex-col justify-between transition-all duration-200 hover:border-[#9DB312] hover:shadow-md">
      <div>
        {/* Header with Semantic Icon & Status Badge */}
        <div className="flex justify-between items-center mb-3.5">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-[#F4F7F2] text-[#597C00] flex items-center justify-center font-bold border border-[#E4EBE0] shrink-0 shadow-xs">
              {icon}
            </span>
            <span className="text-[11px] font-bold text-[#617253] uppercase tracking-wider">
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
          <span className="text-3xl lg:text-4xl font-bold font-tabular text-[#1B2408] tracking-tight">
            {metric.valueFormatted}
          </span>
          <span className="text-base font-semibold text-[#617253] font-display">
            {metric.unit}
          </span>
        </div>

        {/* Human-Readable Agronomic Interpretation */}
        <p className="text-xs text-[#617253] leading-relaxed my-2 min-h-[38px]">
          {metric.explanation}
        </p>
      </div>

      {/* Target Range Reference & Timestamp */}
      <div className="pt-3.5 border-t border-[#E4EBE0] flex justify-between items-center text-[11px] gap-2 flex-wrap">
        <span className="font-semibold text-[#597C00] bg-[#F4F7F2] px-2.5 py-1 rounded-lg border border-[#E4EBE0] text-[11px]">
          {metric.reference}
        </span>
        <span className="font-tabular text-[10px] text-[#617253]">
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
          <span className="text-[10px] font-bold text-[#597C00] uppercase tracking-widest block">
            Telemetry Stream
          </span>
          <h2 className="text-lg font-bold text-[#1B2408] tracking-tight font-display">
            Live Environmental Sensors
          </h2>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF4E8] border border-[#C4E1BF] text-xs font-semibold text-[#22531A]">
          <span className="w-2 h-2 rounded-full bg-[#597C00] animate-pulse" />
          <span>Live Telemetry</span>
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
