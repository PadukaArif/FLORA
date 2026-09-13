import React from 'react';
import { useDeviceControl } from '../../hooks/useDeviceControl';
import { DeviceMovementStatus } from '../../types/dashboard';

interface ManualDeviceControlProps {
  onToast?: (message: string) => void;
  limitLeft?: boolean | null;
  limitRight?: boolean | null;
}

export const ManualDeviceControl: React.FC<ManualDeviceControlProps> = ({
  onToast,
  limitLeft,
  limitRight,
}) => {
  const {
    movementStatus,
    isSending,
    lastCommand,
    sendCommand,
    isLeftBlocked,
    isRightBlocked,
  } = useDeviceControl({ onToast, limitLeft, limitRight });

  const getStatusBadge = (status: DeviceMovementStatus) => {
    switch (status) {
      case 'left_command_sent':
        return {
          text: 'SIGNAL SENT: MOVE LEFT',
          classes: 'bg-[#E8F5E9] text-[#1B5E20] border-[#C8E6C9]',
          dot: 'bg-[#2E7D32]',
        };
      case 'right_command_sent':
        return {
          text: 'SIGNAL SENT: MOVE RIGHT',
          classes: 'bg-[#E8F5E9] text-[#1B5E20] border-[#C8E6C9]',
          dot: 'bg-[#2E7D32]',
        };
      case 'stop_command_sent':
        return {
          text: 'STOP COMMAND SENT',
          classes: 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]',
          dot: 'bg-[#D97706]',
        };
      case 'sending':
        return {
          text: 'DISPATCHING TO MQTT...',
          classes: 'bg-[#E0F2FE] text-[#075985] border-[#BAE6FD]',
          dot: 'bg-[#0284C7]',
        };
      case 'error':
        return {
          text: 'DISPATCH ERROR',
          classes: 'bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]',
          dot: 'bg-[#DC2626]',
        };
      default:
        return {
          text: 'CONTROLLER READY (NO MOTOR FEEDBACK)',
          classes: 'bg-[#F2F6F4] text-[#2F6F5E] border-[#E2EAE6]',
          dot: 'bg-[#58977F]',
        };
    }
  };

  const badge = getStatusBadge(movementStatus);

  const getLimitLabel = (val: boolean | null | undefined) => {
    if (val === true) return { text: 'ACTIVE', color: 'text-[#DC2626]' };
    if (val === false) return { text: 'CLEAR', color: 'text-[#2E7D32]' };
    return { text: 'UNKNOWN', color: 'text-[#5C736B]' };
  };

  const leftInfo = getLimitLabel(limitLeft);
  const rightInfo = getLimitLabel(limitRight);

  return (
    <section id="device-control" className="flora-card p-6 mt-8">
      <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
        <div>
          <span className="text-[11px] font-semibold text-[#2F6F5E] uppercase tracking-wider block">
            Linear Actuator Subsystem
          </span>
          <h2 className="text-lg font-bold text-[#17332B] font-display">
            Scanner Carriage Manual Control
          </h2>
        </div>
        <span
          className={`text-xs font-semibold px-3 py-1 rounded-full border flex items-center gap-1.5 ${badge.classes}`}
        >
          <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
          {badge.text}
        </span>
      </div>

      <p className="text-xs text-[#5C736B] mb-5 leading-relaxed max-w-2xl">
        Kirimkan perintah gerak ke carriage scanner optik melalui broker MQTT. Status di bawah mencerminkan sinyal perintah yang diterbitkan (umpan balik posisi fisik motor tidak dilaporkan oleh perangkat keras).
      </p>

      {/* Control Buttons Trio */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Move Left */}
        <button
          onClick={() => sendCommand('L')}
          disabled={isSending || isLeftBlocked}
          className={`py-3 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 border shadow-sm ${
            movementStatus === 'left_command_sent'
              ? 'bg-[#17483B] text-white border-[#17483B] ring-2 ring-[#8FBEA8]'
              : isLeftBlocked
              ? 'bg-[#F2F6F4] text-[#5C736B]/60 border-[#E2EAE6] cursor-not-allowed'
              : 'bg-white hover:bg-[#F2F6F4] text-[#17332B] border-[#E2EAE6]'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          title={isLeftBlocked ? 'Left Limit Switch Active - Left motion blocked' : 'Send move left command'}
        >
          <span>◀</span>
          <span>Move Left</span>
          {isLeftBlocked && (
            <span className="text-[10px] font-semibold bg-[#FEE2E2] text-[#991B1B] px-1.5 py-0.5 rounded border border-[#FECACA]">
              Limit
            </span>
          )}
        </button>

        {/* STOP (Emergency / Halting) */}
        <button
          onClick={() => sendCommand('S')}
          disabled={isSending}
          className="py-3 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white border border-[#B91C1C] shadow-sm disabled:opacity-50"
          title="Send stop motor command immediately"
        >
          <span className="text-sm">■</span>
          <span>STOP MOTOR</span>
        </button>

        {/* Move Right */}
        <button
          onClick={() => sendCommand('R')}
          disabled={isSending || isRightBlocked}
          className={`py-3 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 border shadow-sm ${
            movementStatus === 'right_command_sent'
              ? 'bg-[#17483B] text-white border-[#17483B] ring-2 ring-[#8FBEA8]'
              : isRightBlocked
              ? 'bg-[#F2F6F4] text-[#5C736B]/60 border-[#E2EAE6] cursor-not-allowed'
              : 'bg-white hover:bg-[#F2F6F4] text-[#17332B] border-[#E2EAE6]'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          title={isRightBlocked ? 'Right Limit Switch Active - Right motion blocked' : 'Send move right command'}
        >
          <span>Move Right</span>
          <span>▶</span>
          {isRightBlocked && (
            <span className="text-[10px] font-semibold bg-[#FEE2E2] text-[#991B1B] px-1.5 py-0.5 rounded border border-[#FECACA]">
              Limit
            </span>
          )}
        </button>
      </div>

      {/* Hardware Telemetry & Safety Status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
        <div className="bg-[#F2F6F4] border border-[#E2EAE6] rounded-xl p-3 flex items-center justify-between">
          <span className="text-[10px] font-semibold text-[#5C736B] uppercase tracking-wider">
            Command Dispatch
          </span>
          <span className="text-xs font-bold text-[#17332B] capitalize">
            {movementStatus.replace(/_/g, ' ')}
          </span>
        </div>

        <div className="bg-[#F2F6F4] border border-[#E2EAE6] rounded-xl p-3 flex items-center justify-between">
          <span className="text-[10px] font-semibold text-[#5C736B] uppercase tracking-wider">
            Last Command Sent
          </span>
          <span className="text-xs font-bold font-tabular text-[#17332B]">
            {lastCommand ? `Cmd '${lastCommand}'` : 'None'}
          </span>
        </div>

        <div className="bg-[#F2F6F4] border border-[#E2EAE6] rounded-xl p-3 flex items-center justify-between">
          <span className="text-[10px] font-semibold text-[#5C736B] uppercase tracking-wider">
            Limit Switches
          </span>
          <div className="flex items-center gap-2 text-xs font-bold font-tabular">
            <span className={leftInfo.color}>
              L: {leftInfo.text}
            </span>
            <span className="text-[#5C736B]/40">|</span>
            <span className={rightInfo.color}>
              R: {rightInfo.text}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[#E2EAE6]">
        <p className="text-[11px] text-[#5C736B] m-0 leading-relaxed">
          Perintah diterbitkan ke MQTT topic <code className="bg-[#F2F6F4] px-1.5 py-0.5 rounded border border-[#E2EAE6] font-mono text-[10px] text-[#17332B]">grenvis/device/control</code>. Status mengonfirmasi transmisi perintah ke broker (bukan konfirmasi sensorik posisi fisik).
        </p>
      </div>
    </section>
  );
};
