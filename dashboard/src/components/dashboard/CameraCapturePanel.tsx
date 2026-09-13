import React from 'react';
import { TelemetryRecord } from '../../types/dashboard';
import { fmt, formatTime } from '../../utils/formatters';

interface CameraCapturePanelProps {
  latest: TelemetryRecord | null;
}

export const CameraCapturePanel: React.FC<CameraCapturePanelProps> = ({ latest }) => {
  const captureUrl = latest?.image_url || latest?.image_path || null;
  const isVisionConnected = Boolean(latest?.vision_connected);

  const captureTime = latest?.image_timestamp
    ? formatTime(latest.image_timestamp)
    : latest?.timestamp
    ? formatTime(latest.timestamp)
    : 'Awaiting first capture';

  const prediction = latest?.vision_prediction || 'Awaiting inference';
  const dominantProb = Math.max(
    Number(latest?.vision_healthy || 0),
    Number(latest?.vision_powdery || 0),
    Number(latest?.vision_rust || 0)
  );

  return (
    <section id="cameraCapture" className="flora-card p-6 mt-8 rounded-2xl bg-white border border-[#E2EAE6] shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-[10px] font-bold text-[#2F6F5E] uppercase tracking-widest block">
            Optical Sensor Subsystem
          </span>
          <h2 className="text-lg font-bold text-[#17332B] font-display mt-0.5">
            ESP32-CAM AI Vision Optical Capture
          </h2>
        </div>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${
            captureUrl
              ? 'bg-[#E8F5E9] text-[#1B5E20] border-[#C8E6C9]'
              : 'bg-[#F2F6F4] text-[#5C736B] border-[#E2EAE6]'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${captureUrl ? 'bg-[#2E7D32]' : 'bg-[#5C736B]'}`} />
          {captureUrl ? 'Optical Frame Uploaded' : 'Telemetry Mode (No Frame)'}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        {/* Optical Frame / Preview */}
        <div className="lg:col-span-2 relative min-h-[290px] bg-[#F2F6F4] border border-[#E2EAE6] rounded-xl overflow-hidden flex flex-col items-center justify-center text-center p-6">
          {captureUrl ? (
            <img
              src={captureUrl}
              alt="Leaf canopy capture from ESP32-CAM"
              className="w-full h-full object-cover absolute inset-0"
            />
          ) : (
            <div className="max-w-md p-4 flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-white border border-[#E2EAE6] text-[#2F6F5E] flex items-center justify-center mb-3.5 shadow-sm">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-[#17332B] font-display uppercase tracking-wide mb-1">
                WAITING FOR CAMERA DATA
              </h3>
              <p className="text-xs text-[#5C736B] leading-relaxed m-0 max-w-sm">
                The vision system is ready for the next scan.
              </p>
              <div className="mt-3 px-2.5 py-1 rounded-md bg-white border border-[#E2EAE6] text-[10px] text-[#5C736B] font-medium">
                {isVisionConnected ? 'ESP-NOW inference stream active' : 'ESP32-CAM node in standby'}
              </div>
            </div>
          )}

          <div className="absolute left-3 bottom-3 px-2.5 py-1 rounded-lg bg-[#17483B]/85 text-[#DCECE5] text-[10px] font-medium backdrop-blur-sm pointer-events-none border border-[#235849]">
            ESP32-CAM Optical Node · ESP-NOW Transport
          </div>
        </div>

        {/* Inference & Telemetry Metadata */}
        <div className="flex flex-col justify-between gap-3">
          <div className="space-y-2.5">
            <div className="bg-[#F2F6F4] border border-[#E2EAE6] rounded-xl p-3.5">
              <span className="text-[10px] font-bold text-[#5C736B] uppercase tracking-wider block">
                Last Optical Scan Time
              </span>
              <span className="text-sm font-bold text-[#17332B] font-tabular block mt-1">
                {captureTime}
              </span>
            </div>

            <div className="bg-[#F2F6F4] border border-[#E2EAE6] rounded-xl p-3.5">
              <span className="text-[10px] font-bold text-[#5C736B] uppercase tracking-wider block">
                AI Detected Pattern
              </span>
              <span className="text-sm font-bold text-[#17332B] block mt-1 capitalize font-display">
                {prediction}
              </span>
            </div>

            <div className="bg-[#F2F6F4] border border-[#E2EAE6] rounded-xl p-3.5">
              <span className="text-[10px] font-bold text-[#5C736B] uppercase tracking-wider block">
                Dominant Confidence
              </span>
              <span className="text-sm font-bold text-[#17332B] font-tabular block mt-1">
                {dominantProb > 0 ? `${fmt(dominantProb)}%` : '—'}
              </span>
            </div>
          </div>

          <div className="bg-[#F2F6F4] border border-[#E2EAE6] p-3.5 rounded-xl">
            <p className="text-[11px] text-[#5C736B] m-0 leading-relaxed">
              Citra optik dan telemetri inferensi TFLite ditransmisikan secara nirkabel untuk pemantauan dini kesehatan daun.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
