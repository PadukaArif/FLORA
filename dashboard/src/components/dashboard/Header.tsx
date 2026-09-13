import React from 'react';
import { useClock } from '../../hooks/useClock';

interface HeaderProps {
  onRefresh: () => void;
  onOpenMobileMenu?: () => void;
  isRefreshing?: boolean;
  mqttStatus?: string;
  isStale?: boolean;
  lastTelemetryText?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onRefresh,
  onOpenMobileMenu,
  isRefreshing,
  mqttStatus = 'DISCONNECTED',
  isStale = false,
  lastTelemetryText,
}) => {
  const clock = useClock();
  const isMqttConnected = mqttStatus === 'CONNECTED';

  return (
    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 mb-6 border-b border-[#E2EAE6]">
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-lg bg-white border border-[#E2EAE6] text-[#17332B] hover:bg-[#F2F6F4] text-lg font-bold"
            aria-label="Open Navigation"
          >
            ☰
          </button>
        )}
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold tracking-wider text-[#2F6F5E] uppercase">
              Smart Agriculture &amp; Environmental Intelligence
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#17332B] mt-0.5 tracking-tight font-display">
            Plant Monitoring Console
          </h1>
          <p className="text-xs text-[#5C736B] mt-0.5">
            Realtime ESP32 IoT telemetry, microclimate risk assessment &amp; AI vision.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 self-end sm:self-auto flex-wrap">
        {/* Realtime Status Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-[#E2EAE6] text-xs shadow-sm">
          <span
            className={`w-2 h-2 rounded-full ${
              isMqttConnected && !isStale
                ? 'bg-[#2E7D32] animate-pulse'
                : isMqttConnected && isStale
                ? 'bg-[#D97706]'
                : 'bg-[#DC2626]'
            }`}
          />
          <span className="font-medium text-[#17332B]">
            {isMqttConnected
              ? isStale
                ? 'Telemetry Stale'
                : 'Live Stream'
              : 'MQTT Disconnected'}
          </span>
          {lastTelemetryText && (
            <span className="text-[10px] text-[#5C736B] font-tabular border-l border-[#E2EAE6] pl-2">
              {lastTelemetryText}
            </span>
          )}
        </div>

        {/* Clock */}
        <span className="hidden md:inline-block px-3 py-1.5 rounded-lg bg-white border border-[#E2EAE6] text-xs font-medium text-[#17332B] font-tabular shadow-sm">
          {clock}
        </span>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="px-3.5 py-1.5 rounded-lg bg-[#2F6F5E] hover:bg-[#17483B] text-white text-xs font-semibold transition-all shadow-sm disabled:opacity-50 flex items-center gap-1.5"
        >
          <span className={isRefreshing ? 'animate-spin inline-block' : ''}>↻</span>
          <span>{isRefreshing ? 'Syncing...' : 'Refresh'}</span>
        </button>
      </div>
    </header>
  );
};
