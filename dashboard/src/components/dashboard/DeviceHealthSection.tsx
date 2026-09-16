import React from 'react';
import { TelemetryRecord, MqttStatus, SystemStatusInfo } from '../../types/dashboard';

interface DeviceHealthSectionProps {
  latest: TelemetryRecord | null;
  mqttStatus?: MqttStatus;
  wsStatus?: 'connecting' | 'connected' | 'disconnected';
  systemStatus?: SystemStatusInfo;
}

export const DeviceHealthSection: React.FC<DeviceHealthSectionProps> = ({
  latest,
  mqttStatus = 'DISCONNECTED',
  wsStatus = 'connecting',
  systemStatus,
}) => {
  const isOnline = systemStatus
    ? systemStatus.isLive
    : latest?.timestamp
    ? Date.now() - Date.parse(latest.timestamp) <= 15000
    : false;

  // 1. ESP32 Main Node
  const esp32Status = !latest
    ? wsStatus === 'connecting' ? 'CONNECTING' : 'UNKNOWN'
    : isOnline ? 'CONNECTED' : 'DISCONNECTED';
  const esp32Mac = latest?.esp32_mac || 'UNKNOWN';

  // 2. ESP32-CAM Node
  const camStatus = !latest
    ? 'UNKNOWN'
    : latest.vision_connected && isOnline
    ? 'CONNECTED'
    : isOnline
    ? 'STANDBY / DISCONNECTED'
    : 'DISCONNECTED';
  const camMac = latest?.esp32cam_mac || 'UNKNOWN';

  // 3. MQTT Broker
  const mqttText = mqttStatus === 'CONNECTED'
    ? 'CONNECTED'
    : mqttStatus === 'RECONNECTING'
    ? 'CONNECTING'
    : 'DISCONNECTED';

  // 4. WebSocket Stream
  const wsText = wsStatus === 'connected'
    ? 'CONNECTED'
    : wsStatus === 'connecting'
    ? 'CONNECTING'
    : 'DISCONNECTED';

  // 5. ESP-NOW Link
  const espNowStatus = !latest
    ? 'UNKNOWN'
    : latest.vision_connected && isOnline
    ? 'ACTIVE'
    : latest.wifi_channel
    ? `STANDBY (CH ${latest.wifi_channel})`
    : 'UNKNOWN';

  // 6. DHT22
  const dhtStatus = !latest
    ? 'UNKNOWN'
    : isOnline && latest.temperature !== undefined && latest.humidity !== undefined
    ? 'STREAMING'
    : isOnline
    ? 'UNKNOWN'
    : 'OFFLINE';

  // 7. Soil Sensor
  const soilStatus = !latest
    ? 'UNKNOWN'
    : isOnline && latest.soil_moisture !== undefined
    ? 'STREAMING'
    : isOnline
    ? 'UNKNOWN'
    : 'OFFLINE';

  // 8. Motor / Carriage
  const motorStatus = 'READY (NO FEEDBACK)';

  // 9. Limit Switches
  const leftText = latest?.limit_left === true
    ? 'ACTIVE'
    : latest?.limit_left === false
    ? 'CLEAR'
    : 'UNKNOWN';
  const rightText = latest?.limit_right === true
    ? 'ACTIVE'
    : latest?.limit_right === false
    ? 'CLEAR'
    : 'UNKNOWN';

  const getDotClass = (status: string) => {
    switch (status) {
      case 'CONNECTED':
      case 'STREAMING':
      case 'ACTIVE':
        return 'bg-[#367C29]';
      case 'CONNECTING':
      case 'READY (NO FEEDBACK)':
        return 'bg-[#D97706]';
      case 'DISCONNECTED':
      case 'OFFLINE':
        return 'bg-[#DC2626]';
      default:
        return 'bg-[#617253]';
    }
  };

  const devices = [
    {
      label: 'ESP32 Main Node',
      status: esp32Status,
      detail: `MAC: ${esp32Mac}`,
    },
    {
      label: 'ESP32-CAM Node',
      status: camStatus,
      detail: `MAC: ${camMac}`,
    },
    {
      label: 'MQTT Broker',
      status: mqttText,
      detail: 'TLS Transport Pipeline',
    },
    {
      label: 'WebSocket Stream',
      status: wsText,
      detail: 'Client-Server Live Channel',
    },
    {
      label: 'ESP-NOW Link',
      status: espNowStatus,
      detail: 'Inter-Board Wireless Mesh',
    },
    {
      label: 'DHT22 Sensor',
      status: dhtStatus,
      detail: 'Temperature & Air Humidity',
    },
    {
      label: 'Soil Moisture Probe',
      status: soilStatus,
      detail: 'Simulated in firmware (70%)',
    },
    {
      label: 'Scanner Motor',
      status: motorStatus,
      detail: 'Open-loop Carriage Drive',
    },
  ];

  return (
    <section id="devices" className="mt-8">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-[10px] font-bold text-[#597C00] uppercase tracking-widest block">
            Infrastructure Status
          </span>
          <h2 className="text-lg font-bold text-[#1B2408] font-display">
            System &amp; Hardware Health Topology
          </h2>
        </div>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
            systemStatus?.state === 'LIVE'
              ? 'bg-[#EAF4E8] text-[#22531A] border-[#C4E1BF]'
              : systemStatus?.state === 'STALE'
              ? 'bg-[#FEF7E8] text-[#8A570C] border-[#FDE3B5]'
              : isOnline && mqttStatus === 'CONNECTED'
              ? 'bg-[#EAF4E8] text-[#22531A] border-[#C4E1BF]'
              : 'bg-[#FEF7E8] text-[#8A570C] border-[#FDE3B5]'
          }`}
        >
          {systemStatus
            ? systemStatus.state === 'LIVE'
              ? 'Telemetry Stream Active'
              : systemStatus.state === 'STALE'
              ? 'Telemetry Stale'
              : systemStatus.badgeText
            : isOnline && mqttStatus === 'CONNECTED'
            ? 'Telemetry Stream Active'
            : 'Degraded Telemetry'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {devices.map((dev) => (
          <article key={dev.label} className="flora-card p-4 shadow-xs">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-bold text-[#617253] uppercase tracking-wider">
                {dev.label}
              </span>
              <span className={`w-2 h-2 rounded-full ${getDotClass(dev.status)}`} />
            </div>
            <span className="text-sm font-bold text-[#1B2408] block font-display">
              {dev.status}
            </span>
            <span className="text-[11px] font-mono text-[#617253] block mt-1 truncate">
              {dev.detail}
            </span>
          </article>
        ))}

        {/* 9th Card: Limit Switches */}
        <article className="flora-card p-4 shadow-xs">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-bold text-[#617253] uppercase tracking-wider">
              Limit Switches
            </span>
            <span className={`w-2 h-2 rounded-full ${leftText === 'ACTIVE' || rightText === 'ACTIVE' ? 'bg-[#DC2626]' : 'bg-[#367C29]'}`} />
          </div>
          <div className="flex items-center gap-2 text-sm font-bold font-display mt-0.5">
            <span className={leftText === 'ACTIVE' ? 'text-[#DC2626]' : leftText === 'CLEAR' ? 'text-[#22531A]' : 'text-[#617253]'}>
              L: {leftText}
            </span>
            <span className="text-[#617253]/40">|</span>
            <span className={rightText === 'ACTIVE' ? 'text-[#DC2626]' : rightText === 'CLEAR' ? 'text-[#22531A]' : 'text-[#617253]'}>
              R: {rightText}
            </span>
          </div>
          <span className="text-[11px] text-[#617253] block mt-1">
            Endstop Safety Interlock
          </span>
        </article>
      </div>
    </section>
  );
};
