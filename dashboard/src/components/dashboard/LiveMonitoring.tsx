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
  icon: string;
  metric: MetricInterpretation;
  updatedText: string;
}

const SensorCard: React.FC<SensorCardProps> = ({ title, icon, metric, updatedText }) => {
  return (
    <article className="flora-card p-5 lg:p-6 flex flex-col justify-between transition-all hover:border-[#8FBEA8]">
      <div>
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-[#F2F6F4] text-[#2F6F5E] flex items-center justify-center font-bold text-xs border border-[#E2EAE6]">
              {icon}
            </span>
            <span className="text-xs font-semibold text-[#5C736B] uppercase tracking-wider">
              {title}
            </span>
          </div>

          <span
            className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5"
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

        {/* Value */}
        <div className="my-2">
          <span className="text-3xl lg:text-4xl font-bold font-tabular text-[#17332B] tracking-tight">
            {metric.valueFormatted}
          </span>
          <span className="text-sm font-semibold text-[#5C736B] ml-1.5 font-display">
            {metric.unit}
          </span>
        </div>

        {/* Concise Agronomic Interpretation */}
        <p className="text-xs text-[#5C736B] leading-relaxed my-2 min-h-[36px]">
          {metric.explanation}
        </p>
      </div>

      {/* Footer / Reference & Update */}
      <div className="pt-3 border-t border-[#E2EAE6] flex justify-between items-center text-[11px] text-[#5C736B]">
        <span className="font-medium text-[#2F6F5E] bg-[#F2F6F4] px-2 py-0.5 rounded border border-[#E2EAE6]">
          {metric.reference}
        </span>
        <span className="font-tabular text-[10px]">
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
          icon="°"
          metric={tempMetric}
          updatedText={updatedText}
        />
        <SensorCard
          title="Air Humidity"
          icon="◒"
          metric={humMetric}
          updatedText={updatedText}
        />
        <SensorCard
          title="Soil Moisture"
          icon="⌁"
          metric={soilMetric}
          updatedText={updatedText}
        />
      </div>
    </section>
  );
};
