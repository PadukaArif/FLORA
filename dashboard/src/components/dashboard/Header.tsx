import React from 'react';
import { useClock } from '../../hooks/useClock';
import { SystemStatusInfo } from '../../types/dashboard';

interface HeaderProps {
  onRefresh: () => void;
  onOpenMobileMenu?: () => void;
  isRefreshing?: boolean;
  systemStatus?: SystemStatusInfo;
  mqttStatus?: string;
  isStale?: boolean;
  lastTelemetryText?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onRefresh,
  onOpenMobileMenu,
  isRefreshing,
  systemStatus,
  mqttStatus = 'DISCONNECTED',
  isStale = false,
  lastTelemetryText,
}) => {
  const clock = useClock();

  // Fallback if systemStatus is not provided directly
  const status: SystemStatusInfo = systemStatus || {
    state: mqttStatus === 'CONNECTED' ? (isStale ? 'STALE' : 'LIVE') : 'DISCONNECTED',
    label: mqttStatus === 'CONNECTED' ? (isStale ? 'STALE' : 'LIVE') : 'DISCONNECTED',
    badgeText: mqttStatus === 'CONNECTED' ? (isStale ? 'Telemetry Stale' : 'Live Stream') : 'Disconnected',
    description:
      mqttStatus === 'CONNECTED'
        ? isStale
          ? 'Telemetry stale'
          : 'Live telemetry'
        : 'Trying to reconnect...',
    lastUpdateText: lastTelemetryText ? `Last update: ${lastTelemetryText}` : null,
    secondsAgo: null,
    indicatorColor:
      mqttStatus === 'CONNECTED' && !isStale
        ? 'bg-[#597C00] animate-pulse'
        : mqttStatus === 'CONNECTED' && isStale
        ? 'bg-[#D97706]'
        : 'bg-[#DC2626]',
    reconnectMessage: mqttStatus === 'CONNECTED' ? null : 'Trying to reconnect...',
    isLive: mqttStatus === 'CONNECTED' && !isStale,
    isStale,
  };

  const getStatusDisplayText = () => {
    switch (status.state) {
      case 'LIVE':
        return status.lastUpdateText || 'Live telemetry';
      case 'STALE':
        return status.description || 'Telemetry stale';
      case 'CONNECTED':
        return 'Connection established. Waiting for telemetry.';
      case 'LOADING':
        return 'Connecting to FLORA...';
      case 'DISCONNECTED':
        return 'Disconnected · Trying to reconnect...';
      case 'ERROR':
        return status.description || 'Connection error';
      default:
        return status.description;
    }
  };

  return (
    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 mb-5 border-b border-[#E4EBE0]">
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl bg-white border border-[#E4EBE0] text-[#1B2408] hover:bg-[#F4F7F2] text-lg font-bold shadow-xs cursor-pointer"
            aria-label="Open Navigation Menu"
          >
            ☰
          </button>
        )}
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-widest text-[#597C00] uppercase flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0 C12 7 17 12 24 12 C17 12 12 17 12 24 C12 17 7 12 0 12 C7 12 12 7 12 0 Z" />
              </svg>
              <span>FLORA · Botanical Intelligence</span>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1B2408] mt-0.5 tracking-tight font-display">
            Plant Health Console
          </h1>
          <p className="text-xs text-[#617253] mt-0.5">
            Realtime sensor telemetry, microclimate risk evaluation, and leaf vision classification.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 self-end sm:self-auto flex-wrap">
        {/* Realtime System Channel State Badge */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#E4EBE0] text-xs shadow-xs"
          title={status.description}
        >
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${status.indicatorColor}`}
          />
          <span className="font-bold text-[#1B2408] font-display text-[11px] uppercase tracking-wider">
            {status.state}
          </span>
          <span className="text-[11px] text-[#617253] font-tabular border-l border-[#E4EBE0] pl-2 hidden sm:inline-block max-w-[220px] truncate">
            {getStatusDisplayText()}
          </span>
        </div>

        {/* Clock */}
        <span className="hidden md:inline-block px-3 py-1.5 rounded-xl bg-white border border-[#E4EBE0] text-xs font-medium text-[#1B2408] font-tabular shadow-xs">
          {clock}
        </span>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="px-3.5 py-1.5 rounded-xl bg-[#597C00] hover:bg-[#486500] text-white text-xs font-semibold transition-all shadow-xs disabled:opacity-50 flex items-center gap-1.5 cursor-pointer active:scale-95"
        >
          <span className={isRefreshing ? 'animate-spin inline-block' : ''}>↻</span>
          <span>{isRefreshing ? 'Syncing...' : 'Refresh'}</span>
        </button>
      </div>
    </header>
  );
};
