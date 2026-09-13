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
  const camStatus = isVisionActive ? 'ONLINE (ESP-NOW)' : 'STANDBY / OFFLINE';
  const camMac = latest?.esp32cam_mac || '—';

  const mqtt = mqttStatus || 'DISCONNECTED';
  const wifiChannel = latest?.wifi_channel !== undefined ? `CH ${latest.wifi_channel}` : '—';

  const dhtStatus = isOnline ? 'OPERATIONAL' : 'STANDBY';
  const soilStatus = isOnline ? 'OPERATIONAL' : 'STANDBY';
  const l298nStatus = mqtt === 'CONNECTED' ? 'PIPE READY' : 'OFFLINE';

  const leftLimit = Boolean(latest?.limit_left);
  const rightLimit = Boolean(latest?.limit_right);
  const limitSummary = leftLimit || rightLimit ? 'LIMIT ENGAGED' : 'CLEAR';

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
          {isOnline && mqtt === 'CONNECTED' ? 'Mesh Sync Healthy' : 'Degraded Sync'}
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

        {/* MQTT TLS Pipeline */}
        <article className="flora-card p-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-semibold text-[#5C736B] uppercase tracking-wider">
              MQTT Broker (TLS)
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
            EMQX Cloud TLS Port 8883
          </span>
        </article>

        {/* WiFi & ESP-NOW Channel */}
        <article className="flora-card p-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-semibold text-[#5C736B] uppercase tracking-wider">
              WiFi / ESP-NOW
            </span>
            <span className="w-2 h-2 rounded-full bg-[#2E7D32]" />
          </div>
          <span className="text-sm font-bold text-[#17332B] block font-display font-tabular">
            Channel {wifiChannel}
          </span>
          <span className="text-[11px] text-[#5C736B] block mt-1">
            Peer Mesh Active
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
            GPIO 4 Single-Bus
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
          <span className="text-sm font-bold text-[#17332B] block font-display">
            {l298nStatus}
          </span>
          <span className="text-[11px] text-[#5C736B] block mt-1">
            DC Linear Actuator
          </span>
        </article>

        {/* Limit Switches */}
        <article className="flora-card p-4">
          <span className="text-[10px] font-semibold text-[#5C736B] uppercase tracking-wider block mb-1">
            End-Stop Limit Switches
          </span>
          <span
            className={`text-sm font-bold font-display block ${
              leftLimit || rightLimit ? 'text-[#DC2626]' : 'text-[#2E7D32]'
            }`}
          >
            {limitSummary}
          </span>
          <span className="text-[11px] font-tabular text-[#5C736B] block mt-1">
            L: {leftLimit ? 'HIT' : 'OK'} | R: {rightLimit ? 'HIT' : 'OK'}
          </span>
        </article>
      </div>
    </section>
  );
};
