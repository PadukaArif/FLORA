import React from 'react';
import { TelemetryRecord, MqttStatus } from '../../types/dashboard';

interface DeviceHealthSectionProps {
  latest: TelemetryRecord | null;
  mqttStatus?: MqttStatus;
}

export const DeviceHealthSection: React.FC<DeviceHealthSectionProps> = ({ latest, mqttStatus }) => {
  const isOnline = latest?.timestamp
    ? Date.now() - Date.parse(latest.timestamp) < 25000
    : false;

  const mainStatus = isOnline ? 'ONLINE' : 'OFFLINE';
  const mainMac = latest?.esp32_mac || '—';

  const isVisionActive = isOnline && Boolean(latest?.vision_connected);
  const camStatus = isVisionActive ? 'ESP-NOW ACTIVE' : 'STANDBY / NO SIGNAL';
  const camMac = latest?.esp32cam_mac || '—';

  const mqtt = mqttStatus || 'DISCONNECTED';
  const hasWifiChannel = latest?.wifi_channel !== undefined && latest.wifi_channel !== null;
  const wifiChannelText = hasWifiChannel ? `CH ${latest!.wifi_channel}` : '—';

  const dhtStatus = isOnline ? 'STREAMING' : 'NO STREAM';
  const soilStatus = isOnline ? 'STREAMING' : 'NO STREAM';
  const l298nStatus = 'NOT REPORTED';

  const hasLeftLimit = latest?.limit_left !== undefined && latest?.limit_left !== null;
  const hasRightLimit = latest?.limit_right !== undefined && latest?.limit_right !== null;
  const leftText = latest?.limit_left === true ? 'ACTIVE' : latest?.limit_left === false ? 'CLEAR' : 'UNKNOWN';
  const rightText = latest?.limit_right === true ? 'ACTIVE' : latest?.limit_right === false ? 'CLEAR' : 'UNKNOWN';

  const limitSummary =
    latest?.limit_left === true || latest?.limit_right === true
      ? 'LIMIT ACTIVE'
      : !hasLeftLimit && !hasRightLimit
      ? 'NOT REPORTED'
      : 'CLEAR';

  const limitColor =
    limitSummary === 'LIMIT ACTIVE'
      ? 'text-[#DC2626]'
      : limitSummary === 'CLEAR'
      ? 'text-[#2E7D32]'
      : 'text-[#5C736B]';

  return (
    <section id="devices" className="mt-8">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-[11px] font-semibold text-[#2F6F5E] uppercase tracking-wider block">
            Hardware &amp; Network Infrastructure
          </span>
          <h2 className="text-lg font-bold text-[#17332B] font-display">
            System &amp; Device Topology
          </h2>
        </div>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
            isOnline && mqtt === 'CONNECTED'
              ? 'bg-[#E8F5E9] text-[#1B5E20] border-[#C8E6C9]'
              : 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]'
          }`}
        >
          {isOnline && mqtt === 'CONNECTED' ? 'Telemetry Stream Active' : 'Degraded Telemetry'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* ESP32 Main Core */}
        <article className="flora-card p-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-semibold text-[#5C736B] uppercase tracking-wider">
              ESP32 Main Node
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                isOnline ? 'bg-[#2E7D32]' : 'bg-[#DC2626]'
              }`}
            />
          </div>
          <span className="text-sm font-bold text-[#17332B] block font-display">
            {mainStatus}
          </span>
          <span className="text-[11px] font-mono text-[#5C736B] block mt-1">
            MAC: {mainMac}
          </span>
        </article>

        {/* ESP32-CAM Node */}
        <article className="flora-card p-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-semibold text-[#5C736B] uppercase tracking-wider">
              ESP32-CAM Node
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                isVisionActive ? 'bg-[#2E7D32]' : 'bg-[#D97706]'
              }`}
            />
          </div>
          <span className="text-sm font-bold text-[#17332B] block font-display">
            {camStatus}
          </span>
          <span className="text-[11px] font-mono text-[#5C736B] block mt-1">
            MAC: {camMac}
          </span>
        </article>

        {/* MQTT Broker Status */}
        <article className="flora-card p-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-semibold text-[#5C736B] uppercase tracking-wider">
              MQTT Broker
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                mqtt === 'CONNECTED' ? 'bg-[#2E7D32]' : 'bg-[#DC2626]'
              }`}
            />
          </div>
          <span className="text-sm font-bold text-[#17332B] block font-display">
            {mqtt}
          </span>
          <span className="text-[11px] text-[#5C736B] block mt-1">
            Broker Transport Pipeline
          </span>
        </article>

        {/* WiFi / ESP-NOW Channel */}
        <article className="flora-card p-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-semibold text-[#5C736B] uppercase tracking-wider">
              WiFi / ESP-NOW
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                hasWifiChannel ? 'bg-[#2E7D32]' : 'bg-[#5C736B]'
              }`}
            />
          </div>
          <span className="text-sm font-bold text-[#17332B] block font-display font-tabular">
            Channel: {wifiChannelText}
          </span>
          <span className="text-[11px] text-[#5C736B] block mt-1">
            {hasWifiChannel ? 'Reported via ESP32 telemetry' : 'Awaiting telemetry'}
          </span>
        </article>

        {/* DHT22 Sensor */}
        <article className="flora-card p-4">
          <span className="text-[10px] font-semibold text-[#5C736B] uppercase tracking-wider block mb-1">
            DHT22 Temp/Humidity
          </span>
          <span className="text-sm font-bold text-[#17332B] block font-display">
            {dhtStatus}
          </span>
          <span className="text-[11px] text-[#5C736B] block mt-1">
            GPIO 4 Sensor Bus
          </span>
        </article>

        {/* Soil Moisture ADC */}
        <article className="flora-card p-4">
          <span className="text-[10px] font-semibold text-[#5C736B] uppercase tracking-wider block mb-1">
            Soil Moisture Probe
          </span>
          <span className="text-sm font-bold text-[#17332B] block font-display">
            {soilStatus}
          </span>
          <span className="text-[11px] text-[#5C736B] block mt-1">
            Analog ADC Input
          </span>
        </article>

        {/* L298N Motor Driver */}
        <article className="flora-card p-4">
          <span className="text-[10px] font-semibold text-[#5C736B] uppercase tracking-wider block mb-1">
            L298N H-Bridge Driver
          </span>
          <span className="text-sm font-bold text-[#5C736B] block font-display">
            {l298nStatus}
          </span>
          <span className="text-[11px] text-[#5C736B] block mt-1">
            No hardware telemetry line
          </span>
        </article>

        {/* Limit Switches */}
        <article className="flora-card p-4">
          <span className="text-[10px] font-semibold text-[#5C736B] uppercase tracking-wider block mb-1">
            End-Stop Limit Switches
          </span>
          <span
            className={`text-sm font-bold font-display block ${limitColor}`}
          >
            {limitSummary}
          </span>
          <span className="text-[11px] font-tabular text-[#5C736B] block mt-1">
            L: {leftText} | R: {rightText}
          </span>
        </article>
      </div>
    </section>
  );
};
