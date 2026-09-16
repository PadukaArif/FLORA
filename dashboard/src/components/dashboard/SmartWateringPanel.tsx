import React, { useState, useMemo } from 'react';
import { TelemetryRecord, WateringEvent } from '../../types/dashboard';

interface SmartWateringPanelProps {
  latest: TelemetryRecord | null;
  onWatered: (note?: string) => Promise<WateringEvent | void>;
  wateringEvents?: WateringEvent[];
  lastWateringEvent?: WateringEvent | null;
}

export const SmartWateringPanel: React.FC<SmartWateringPanelProps> = ({
  latest,
  onWatered,
  wateringEvents,
  lastWateringEvent,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ title: string; subtitle: string } | null>(null);
  const [localEvents, setLocalEvents] = useState<WateringEvent[]>([]);

  // 1. Current Irrigation Condition derived strictly from actual telemetry
  const condition = useMemo(() => {
    if (!latest) {
      return {
        title: 'Awaiting telemetry data',
        description: 'Waiting for sensor readings to assess irrigation condition.',
      };
    }

    const moisture = Number(latest.soil_moisture);
    const status = latest.watering_status || '';

    if (status === 'URGENT_CHECK' || (!isNaN(moisture) && moisture < 20)) {
      return {
        title: 'Attention needed',
        description:
          latest.watering_description ||
          'Very low soil moisture detected. Check the plant promptly.',
      };
    }
    if (status === 'WATERING_RECOMMENDED' || (!isNaN(moisture) && moisture < 30)) {
      return {
        title: 'Check watering',
        description:
          latest.watering_description ||
          'Low soil moisture detected. Check the plant and consider watering.',
      };
    }
    if (status === 'TOO_WET' || (!isNaN(moisture) && moisture > 80)) {
      return {
        title: 'Soil is saturated',
        description:
          latest.watering_description ||
          'High soil moisture detected. Defer watering to avoid over-saturation.',
      };
    }
    if (status === 'MONITOR') {
      return {
        title: 'Monitoring moisture',
        description:
          latest.watering_description ||
          'Single low reading detected. Monitoring next telemetry cycle.',
      };
    }

    return {
      title: 'No watering needed',
      description:
        latest.watering_description ||
        'Soil moisture is currently sufficient based on the latest reading.',
    };
  }, [latest]);

  // 2. Aggregate real events without duplicating or inventing data
  const allEvents = useMemo(() => {
    const combined = [...localEvents];
    const existingIds = new Set(localEvents.map((e) => e.id));

    if (wateringEvents && Array.isArray(wateringEvents)) {
      for (const ev of wateringEvents) {
        if (!existingIds.has(ev.id)) {
          combined.push(ev);
        }
      }
    } else if (lastWateringEvent && !existingIds.has(lastWateringEvent.id)) {
      combined.push(lastWateringEvent);
    }

    return combined.sort((a, b) => {
      const timeA = Date.parse(a.timestamp) || a.id;
      const timeB = Date.parse(b.timestamp) || b.id;
      return timeB - timeA;
    });
  }, [wateringEvents, lastWateringEvent, localEvents]);

  const latestEvent = allEvents[0] || null;
  const recentHistory = allEvents.slice(0, 5);

  const formatEventTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return { full: isoString, timeOnly: isoString };
      const timeOnly = d.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      const now = new Date();
      const isToday = d.toDateString() === now.toDateString();
      const full = isToday
        ? `Today, ${timeOnly}`
        : `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${timeOnly}`;
      return { full, timeOnly };
    } catch {
      return { full: isoString, timeOnly: isoString };
    }
  };

  const handleWaterClick = async () => {
    try {
      setIsSubmitting(true);
      const res = await onWatered('Manual watering recorded from console');
      const newEvent: WateringEvent =
        res && res.id
          ? res
          : {
              id: Date.now(),
              timestamp: new Date().toISOString(),
              soil_before: latest?.soil_moisture ?? null,
              note: 'Manual watering recorded from console',
            };
      setLocalEvents((prev) => [newEvent, ...prev.filter((e) => e.id !== newEvent.id)]);
      setNotification({
        title: 'Manual irrigation recorded',
        subtitle: 'Saved as a watering event. No pump command was sent.',
      });
    } catch {
      setNotification({
        title: 'Could not record manual irrigation',
        subtitle: 'Please check connection to FLORA service.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const moistureVal = latest?.soil_moisture;
  const hasMoisture = moistureVal !== undefined && moistureVal !== null && !isNaN(Number(moistureVal));

  return (
    <section className="flora-card p-6 flex flex-col justify-between shadow-xs">
      <div>
        {/* 1. CURRENT CONDITION */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-[#597C00] uppercase tracking-widest block">
              Irrigation
            </span>
            {hasMoisture && (
              <span className="text-[11px] font-tabular text-[#617253]">
                Soil moisture: <strong className="text-[#1B2408]">{Number(moistureVal).toFixed(0)}%</strong>
              </span>
            )}
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-[#1B2408] font-display capitalize">
            {condition.title}
          </h2>
          <p className="text-xs text-[#617253] mt-1 leading-relaxed m-0">
            {condition.description}
          </p>
        </div>

        {/* 2. LAST MANUAL WATERING (Summary Card) */}
        {latestEvent ? (
          <div className="bg-[#F4F7F2] border border-[#E4EBE0] rounded-xl p-3.5 my-3.5">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#617253]">
                Last Manual Watering
              </span>
              <span className="text-[10px] font-semibold text-[#22531A] bg-[#EAF4E8] px-2 py-0.5 rounded-md border border-[#C4E1BF]">
                Recorded
              </span>
            </div>
            <div className="text-sm font-bold font-display text-[#1B2408]">
              {formatEventTime(latestEvent.timestamp).full}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-[#617253] mt-1 font-tabular">
              <span>Method: Manual</span>
              <span className="text-[#617253]/40">·</span>
              <span>Duration: Manual log</span>
            </div>
          </div>
        ) : (
          <div className="bg-[#F4F7F2] border border-[#E4EBE0] rounded-xl p-3.5 my-3.5 text-xs text-[#617253]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#617253] block mb-0.5">
              Last Manual Watering
            </span>
            <span className="text-[11px] text-[#617253]/80 italic">
              No manual irrigation recorded yet.
            </span>
          </div>
        )}

        {/* 3. PRIMARY ACTION & CONCISE NOTIFICATION */}
        {notification && (
          <div className="bg-[#EAF4E8] border border-[#C4E1BF] text-[#22531A] p-3 rounded-xl mb-3 flex items-start justify-between gap-2 animate-in fade-in duration-200">
            <div className="flex items-start gap-2">
              <span className="font-bold text-sm leading-none mt-0.5">✓</span>
              <div>
                <span className="font-bold text-xs block">{notification.title}</span>
                <span className="text-[11px] opacity-90 block mt-0.5">
                  {notification.subtitle}
                </span>
              </div>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-xs text-[#22531A]/60 hover:text-[#22531A] px-1 font-bold cursor-pointer"
              aria-label="Dismiss notification"
            >
              ✕
            </button>
          </div>
        )}

        <button
          onClick={handleWaterClick}
          disabled={isSubmitting}
          className="w-full py-2.5 px-4 rounded-xl bg-[#597C00] hover:bg-[#486500] text-white font-semibold text-xs transition-all shadow-xs disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
        >
          <span>💧</span>
          <span>{isSubmitting ? 'Recording...' : 'Record Manual Irrigation'}</span>
        </button>

        {/* 4. RECENT ACTIVITY (Real Events Only) */}
        {recentHistory.length > 0 ? (
          <div className="mt-4 pt-3 border-t border-[#E4EBE0]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#617253] block mb-2">
              Recent Activity
            </span>
            <div className="space-y-1.5 font-tabular">
              {recentHistory.map((ev) => (
                <div
                  key={ev.id}
                  className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg bg-[#F4F7F2]/60 hover:bg-[#F4F7F2] transition-colors"
                >
                  <span className="font-medium text-[#1B2408]">
                    {formatEventTime(ev.timestamp).timeOnly}
                  </span>
                  <span className="text-[11px] text-[#617253]">
                    Manual watering
                  </span>
                  <span className="text-[10px] font-medium text-[#22531A] bg-[#EAF4E8] px-1.5 py-0.5 rounded border border-[#C4E1BF]/60">
                    Recorded
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-4 pt-3 border-t border-[#E4EBE0]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#617253] block mb-1">
              Recent Activity
            </span>
            <p className="text-[11px] text-[#617253]/80 italic m-0">
              No manual irrigation recorded yet.
            </p>
          </div>
        )}

        {/* 5. AUTOMATIC WATERING (Quiet Secondary Note) */}
        <div className="mt-4 pt-3 border-t border-[#E4EBE0]">
          <div className="flex items-center justify-between text-xs text-[#617253] mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#617253]">
              Automatic Watering
            </span>
            <span className="text-[11px] font-medium text-[#617253]/80">
              Not connected
            </span>
          </div>
          <p className="text-[11px] text-[#617253]/80 m-0 leading-relaxed">
            Automatic watering will be available when an irrigation actuator is connected.
          </p>
        </div>
      </div>
    </section>
  );
};
