import React from 'react';
import { TelemetryRecord } from '../../types/dashboard';
import { fmt, formatTime } from '../../utils/formatters';
import { evaluatePlantPillars } from '../../utils/sensorRules';

interface HeroOverviewProps {
  latest: TelemetryRecord | null;
}

export const HeroOverview: React.FC<HeroOverviewProps> = ({ latest }) => {
  const pillars = evaluatePlantPillars(latest);
  const conditionTitle = latest?.condition?.title || 'Awaiting Telemetry Stream';
  const lastUpdate = latest?.timestamp ? `Updated ${formatTime(latest.timestamp)}` : 'Awaiting data';
  const risk = latest?.sensor_risk ? String(latest.sensor_risk).toUpperCase() : 'UNKNOWN';
  const confidence = latest?.sensor_confidence !== undefined ? `${fmt(latest.sensor_confidence)}% confidence` : null;

  const hasTemp = latest?.temperature !== undefined && latest?.temperature !== null;
  const hasHum = latest?.humidity !== undefined && latest?.humidity !== null;
  const hasSoil = latest?.soil_moisture !== undefined && latest?.soil_moisture !== null;

  const getRiskBadge = (r: string) => {
    switch (r) {
      case 'HIGH':
        return {
          label: 'HIGH RISK',
          bg: 'bg-[#FEEAEA] text-[#961C1C] border-[#FCCECE]',
        };
      case 'MODERATE':
        return {
          label: 'MODERATE RISK',
          bg: 'bg-[#FEF7E8] text-[#8A570C] border-[#FDE3B5]',
        };
      case 'LOW':
        return {
          label: 'LOW RISK',
          bg: 'bg-[#EAF4E8] text-[#22531A] border-[#C4E1BF]',
        };
      default:
        return {
          label: 'AWAITING DATA',
          bg: 'bg-[#141D04] text-[#C3D883] border-[#2C3B0E]',
        };
    }
  };

  const riskBadge = getRiskBadge(risk);

  return (
    <section
      id="overview"
      className="flora-card-hero p-6 lg:p-7 flex flex-col justify-between gap-6 transition-all"
    >
      {/* Header Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-[#334411]">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#9DB312] block">
            FLORA · Botanical Status &amp; Microclimate Overview
          </span>
          <h2 className="text-xl lg:text-2xl font-bold font-display text-white tracking-tight mt-1">
            Plant Condition &amp; Environmental Intelligence
          </h2>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          <span className="text-[11px] text-[#F0F4E8]/90 font-tabular px-2.5 py-1 rounded-xl bg-[#141D04] border border-[#2C3B0E]">
            {lastUpdate}
          </span>
          {latest?.condition?.priority && (
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-xl bg-[#141D04] text-[#C3D883] border border-[#2C3B0E]">
              {latest.condition.priority} Priority
            </span>
          )}
        </div>
      </div>

      {/* Main Grid: Botanical Status + Microclimate Risk Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Overall Botanical Synthesis & Live Pills */}
        <div className="lg:col-span-2 space-y-3.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#9DB312] shadow-[0_0_6px_rgba(157,179,18,0.8)]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#C3D883]">
              Current Botanical Status
            </span>
          </div>

          <h3 className="text-lg lg:text-xl font-bold font-display text-white leading-snug">
            {conditionTitle}
          </h3>

          <p className="text-xs lg:text-sm text-[#F0F4E8]/90 leading-relaxed max-w-2xl">
            {pillars.overallAssessment}
          </p>

          {/* Compact Live Telemetry Pills */}
          <div className="flex items-center gap-2 pt-1 flex-wrap">
            <div className="bg-[#141D04] border border-[#2C3B0E] px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs">
              <span className="text-[#C3D883] text-[11px]">Temp</span>
              <span className="font-bold font-tabular text-white">
                {hasTemp ? `${fmt(latest!.temperature)}°C` : '—'}
              </span>
            </div>

            <div className="bg-[#141D04] border border-[#2C3B0E] px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs">
              <span className="text-[#C3D883] text-[11px]">Humidity</span>
              <span className="font-bold font-tabular text-white">
                {hasHum ? `${fmt(latest!.humidity)}%` : '—'}
              </span>
            </div>

            <div className="bg-[#141D04] border border-[#2C3B0E] px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs">
              <span className="text-[#C3D883] text-[11px]">Soil Moisture</span>
              <span className="font-bold font-tabular text-white">
                {hasSoil ? `${fmt(latest!.soil_moisture)}%` : '—'}
              </span>
            </div>

            {latest?.vision_prediction && (
              <div className="bg-[#141D04] border border-[#2C3B0E] px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs">
                <span className="text-[#C3D883] text-[11px]">AI Vision</span>
                <span className="font-bold font-display text-white capitalize">
                  {latest.vision_prediction}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Microclimate Risk Index Panel */}
        <div className="bg-[#141D04] border border-[#2C3B0E] rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center text-center shadow-inner">
          <span className="text-[10px] text-[#C3D883] uppercase tracking-widest font-bold block mb-1">
            Microclimate Risk Index
          </span>
          <div className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border ${riskBadge.bg} my-2 font-display`}>
            {riskBadge.label}
          </div>
          <span className="text-[11px] text-[#C3D883]/90 font-tabular mt-0.5">
            {confidence || 'Edge AI Inference'}
          </span>
          <p className="text-[10px] text-[#C3D883]/70 mt-2 m-0 leading-tight">
            Evaluated on-device via ESP32 microclimate classifier.
          </p>
        </div>
      </div>

      {/* 4-Pillar Plant Insight Row (Integrated Synthesis) */}
      <div className="pt-4 border-t border-[#334411] grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#141D04]/80 border border-[#2C3B0E] p-3 rounded-xl">
          <span className="text-[10px] font-bold text-[#C3D883] uppercase tracking-wider block">
            1. Environment
          </span>
          <span className="text-xs font-bold text-white block mt-1">
            {pillars.environment.status}
          </span>
          <span className="text-[10px] text-[#F0F4E8]/70 block font-tabular mt-0.5">
            {pillars.environment.detail}
          </span>
        </div>

        <div className="bg-[#141D04]/80 border border-[#2C3B0E] p-3 rounded-xl">
          <span className="text-[10px] font-bold text-[#C3D883] uppercase tracking-wider block">
            2. Soil Moisture
          </span>
          <span className="text-xs font-bold text-white block mt-1">
            {pillars.soil.status}
          </span>
          <span className="text-[10px] text-[#F0F4E8]/70 block font-tabular mt-0.5">
            {pillars.soil.detail}
          </span>
        </div>

        <div className="bg-[#141D04]/80 border border-[#2C3B0E] p-3 rounded-xl">
          <span className="text-[10px] font-bold text-[#C3D883] uppercase tracking-wider block">
            3. AI Risk
          </span>
          <span className="text-xs font-bold text-white block mt-1">
            {pillars.aiRisk.status}
          </span>
          <span className="text-[10px] text-[#F0F4E8]/70 block font-tabular mt-0.5">
            {pillars.aiRisk.detail}
          </span>
        </div>

        <div className="bg-[#141D04]/80 border border-[#2C3B0E] p-3 rounded-xl">
          <span className="text-[10px] font-bold text-[#C3D883] uppercase tracking-wider block">
            4. AI Vision
          </span>
          <span className="text-xs font-bold text-white block mt-1">
            {pillars.aiVision.status}
          </span>
          <span className="text-[10px] text-[#F0F4E8]/70 block font-tabular mt-0.5">
            {pillars.aiVision.detail}
          </span>
        </div>
      </div>
    </section>
  );
};
