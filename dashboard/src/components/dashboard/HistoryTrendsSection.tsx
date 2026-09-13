import React, { useRef, useEffect, useState, useCallback } from 'react';
import { TelemetryRecord, TrendsSummary } from '../../types/dashboard';
import { fmt, formatTime } from '../../utils/formatters';

interface HistoryTrendsSectionProps {
  history: TelemetryRecord[];
  trends?: TrendsSummary;
}

type TimeRange = 'LIVE' | '1H' | '6H' | '24H';

export const HistoryTrendsSection: React.FC<HistoryTrendsSectionProps> = ({ history, trends }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedRange, setSelectedRange] = useState<TimeRange>('24H');
  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number;
    y: number;
    record: TelemetryRecord;
  } | null>(null);

  // Filter history based on time range
  const getFilteredHistory = useCallback((): TelemetryRecord[] => {
    if (!history || history.length === 0) return [];
    
    const now = Date.now();
    let cutoff = 0;

    switch (selectedRange) {
      case 'LIVE':
        return history.slice(-30);
      case '1H':
        cutoff = now - 1 * 3600000;
        break;
      case '6H':
        cutoff = now - 6 * 3600000;
        break;
      case '24H':
      default:
        cutoff = now - 24 * 3600000;
        break;
    }

    const filtered = history.filter((r) => Date.parse(r.timestamp) >= cutoff);
    return filtered.length > 0 ? filtered : history.slice(-48);
  }, [history, selectedRange]);

  const activeData = getFilteredHistory();

  const drawChart = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = rect.width;
    const h = 260;

    if (w === 0) return;

    canvas.width = w * dpr;
    canvas.height = h * dpr;

    const c = canvas.getContext('2d');
    if (!c) return;

    c.scale(dpr, dpr);
    const pLeft = 36;
    const pRight = 16;
    const pTop = 20;
    const pBottom = 28;
    const chartW = w - pLeft - pRight;
    const chartH = h - pTop - pBottom;

    c.clearRect(0, 0, w, h);

    // Draw horizontal grid lines & Y-axis labels
    c.strokeStyle = '#EEF3F0';
    c.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = pTop + (chartH * i) / 4;
      c.beginPath();
      c.moveTo(pLeft, y);
      c.lineTo(w - pRight, y);
      c.stroke();

      c.fillStyle = '#5C736B';
      c.font = '10px "JetBrains Mono", monospace';
      c.textAlign = 'right';
      c.fillText(`${100 - i * 25}%`, pLeft - 6, y + 3);
    }

    if (!activeData || activeData.length === 0) {
      c.fillStyle = '#5C736B';
      c.font = '12px "Plus Jakarta Sans", sans-serif';
      c.textAlign = 'center';
      c.fillText('Menunggu rekaman riwayat sensor...', w / 2, h / 2);
      return;
    }

    // Series Definitions
    const series: Array<{ field: keyof TelemetryRecord; color: string }> = [
      { field: 'temperature', color: '#D97706' },
      { field: 'humidity', color: '#0284C7' },
      { field: 'soil_moisture', color: '#2F6F5E' },
    ];

    series.forEach(({ field, color }) => {
      c.beginPath();
      c.strokeStyle = color;
      c.lineWidth = 2;

      activeData.forEach((r, i) => {
        const val = Number(r[field]);
        const clampedVal = Math.min(100, Math.max(0, isNaN(val) ? 0 : val));
        const x = pLeft + (chartW * i) / Math.max(1, activeData.length - 1);
        const y = pTop + chartH * (1 - clampedVal / 100);

        if (i === 0) {
          c.moveTo(x, y);
        } else {
          c.lineTo(x, y);
        }
      });

      c.stroke();
    });

    // Draw X-axis timestamps (First, Middle, Last)
    if (activeData.length >= 2) {
      c.fillStyle = '#5C736B';
      c.font = '10px "JetBrains Mono", monospace';
      c.textAlign = 'left';
      c.fillText(formatTime(activeData[0].timestamp), pLeft, h - 8);

      c.textAlign = 'center';
      const midIdx = Math.floor(activeData.length / 2);
      c.fillText(formatTime(activeData[midIdx].timestamp), pLeft + chartW / 2, h - 8);

      c.textAlign = 'right';
      c.fillText(formatTime(activeData[activeData.length - 1].timestamp), w - pRight, h - 8);
    }

    // Draw Crosshair if hovering
    if (hoveredPoint) {
      c.strokeStyle = '#58977F';
      c.lineWidth = 1;
      c.setLineDash([3, 3]);
      c.beginPath();
      c.moveTo(hoveredPoint.x, pTop);
      c.lineTo(hoveredPoint.x, pTop + chartH);
      c.stroke();
      c.setLineDash([]);
    }
  }, [activeData, hoveredPoint]);

  useEffect(() => {
    drawChart();

    const handleResize = () => {
      drawChart();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawChart]);

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !activeData || activeData.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pLeft = 36;
    const pRight = 16;
    const chartW = rect.width - pLeft - pRight;

    const relativeX = Math.max(0, Math.min(chartW, x - pLeft));
    const index = Math.round((relativeX / chartW) * (activeData.length - 1));
    const record = activeData[index];

    if (record) {
      setHoveredPoint({
        x: pLeft + (chartW * index) / Math.max(1, activeData.length - 1),
        y: e.clientY - rect.top,
        record,
      });
    }
  };

  const handleCanvasMouseLeave = () => {
    setHoveredPoint(null);
  };

  const trendCards = [
    {
      label: 'Soil Moisture Momentum',
      value: trends?.soil ? trends.soil.replace(/_/g, ' ') : 'Stable',
      statusColor: trends?.soil === 'DECREASING' ? 'text-[#D97706]' : 'text-[#2F6F5E]',
    },
    {
      label: 'Leaf Rust Indication Trend',
      value: trends?.rust ? trends.rust.replace(/_/g, ' ') : 'Stable',
      statusColor: trends?.rust === 'INCREASING' ? 'text-[#9A3412]' : 'text-[#2F6F5E]',
    },
    {
      label: 'Powdery Mildew Trend',
      value: trends?.powdery ? trends.powdery.replace(/_/g, ' ') : 'Stable',
      statusColor: trends?.powdery === 'INCREASING' ? 'text-[#EA580C]' : 'text-[#2F6F5E]',
    },
  ];

  return (
    <section id="history" className="flora-card p-6 mt-8">
      {/* Header & Range Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <div>
          <span className="text-[11px] font-semibold text-[#2F6F5E] uppercase tracking-wider block">
            Environmental History
          </span>
          <h2 className="text-lg font-bold text-[#17332B] font-display">
            Multi-Sensor Historical Trends
          </h2>
        </div>

        {/* Legend and Time Range Selector */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-3 text-xs font-medium text-[#17332B] bg-[#F2F6F4] px-3 py-1.5 rounded-lg border border-[#E2EAE6]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]" />
              Temp
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7]" />
              Humidity
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2F6F5E]" />
              Soil
            </span>
          </div>

          <div className="flex rounded-lg bg-[#F2F6F4] p-0.5 border border-[#E2EAE6] text-xs font-semibold">
            {(['LIVE', '1H', '6H', '24H'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setSelectedRange(range)}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  selectedRange === range
                    ? 'bg-white text-[#17483B] shadow-sm font-bold'
                    : 'text-[#5C736B] hover:text-[#17332B]'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Canvas Chart */}
      <div className="relative w-full h-[260px] my-2 bg-white rounded-xl">
        <canvas
          ref={canvasRef}
          onMouseMove={handleCanvasMouseMove}
          onMouseLeave={handleCanvasMouseLeave}
          className="w-full h-[260px] block cursor-crosshair"
        />

        {/* Floating Tooltip */}
        {hoveredPoint && (
          <div
            className="absolute z-20 pointer-events-none bg-[#17483B] text-white p-3 rounded-xl shadow-xl text-xs border border-[#235849] -translate-x-1/2 -translate-y-full mb-2 min-w-[170px]"
            style={{ left: hoveredPoint.x, top: Math.max(60, hoveredPoint.y) }}
          >
            <div className="text-[10px] text-[#8FBEA8] font-tabular border-b border-[#235849] pb-1 mb-1.5">
              {formatTime(hoveredPoint.record.timestamp)}
            </div>
            <div className="space-y-1 font-tabular">
              <div className="flex justify-between">
                <span className="text-[#DCECE5]">Temp:</span>
                <span className="font-bold text-[#FDE68A]">
                  {fmt(hoveredPoint.record.temperature)}°C
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#DCECE5]">Humidity:</span>
                <span className="font-bold text-[#BAE6FD]">
                  {fmt(hoveredPoint.record.humidity)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#DCECE5]">Soil:</span>
                <span className="font-bold text-[#86EFAC]">
                  {fmt(hoveredPoint.record.soil_moisture)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Trend Momentum Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
        {trendCards.map((item) => (
          <div key={item.label} className="bg-[#F2F6F4] border border-[#E2EAE6] p-3.5 rounded-xl">
            <span className="text-[10px] font-semibold text-[#5C736B] uppercase tracking-wider block">
              {item.label}
            </span>
            <span className={`text-sm font-bold font-display capitalize block mt-0.5 ${item.statusColor}`}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};
