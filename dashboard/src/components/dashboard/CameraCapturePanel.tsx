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
    : 'No scan yet';

  const prediction = latest?.vision_prediction || 'Awaiting inference';
  const dominantProb = Math.max(
    Number(latest?.vision_healthy || 0),
    Number(latest?.vision_powdery || 0),
    Number(latest?.vision_rust || 0)
  );

  return (
    <section id="cameraCapture" className="flora-card p-6 mt-8">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-[11px] font-semibold text-[#2F6F5E] uppercase tracking-wider block">
            Optical Sensor Subsystem
          </span>
          <h2 className="text-lg font-bold text-[#17332B] font-display">
            ESP32-CAM AI Vision Capture
          </h2>
        </div>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
            captureUrl
              ? 'bg-[#E8F5E9] text-[#1B5E20] border-[#C8E6C9]'
              : 'bg-[#F2F6F4] text-[#5C736B] border-[#E2EAE6]'
          }`}
        >
          {captureUrl ? 'Frame Available' : 'Telemetry Mode'}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        {/* Optical Frame / Preview */}
        <div className="lg:col-span-2 relative min-h-[280px] bg-[#F2F6F4] border border-[#E2EAE6] rounded-xl overflow-hidden flex flex-col items-center justify-center text-center p-6">
          {captureUrl ? (
            <img
              src={captureUrl}
              alt="Leaf capture from ESP32-CAM"
              className="w-full h-full object-cover absolute inset-0"
            />
          ) : (
            <div className="max-w-md p-4">
              <div className="w-12 h-12 rounded-xl bg-white border border-[#E2EAE6] text-[#2F6F5E] text-xl font-bold flex items-center justify-center mx-auto mb-3 shadow-sm">
                ◒
              </div>
              <h3 className="text-sm font-bold text-[#17332B] mb-1 font-display">
                {isVisionConnected ? 'Inference Telemetry Active' : 'No Vision Frame Uploaded'}
              </h3>
              <p className="text-xs text-[#5C736B] leading-relaxed m-0">
                ESP32-CAM memproses inferensi AI pada edge device dan mentransmisikan probabilitas melalui ESP-NOW ke ESP32 utama.
              </p>
            </div>
          )}

          <div className="absolute left-3 bottom-3 px-2 py-1 rounded bg-[#17483B]/80 text-[#DCECE5] text-[10px] font-medium backdrop-blur-sm pointer-events-none">
            ESP32-CAM Optical Node · ESP-NOW
          </div>
        </div>

        {/* Inference & Telemetry Metadata */}
        <div className="flex flex-col justify-between gap-3">
          <div className="space-y-2.5">
            <div className="bg-[#F2F6F4] border border-[#E2EAE6] rounded-xl p-3.5">
              <span className="text-[10px] font-semibold text-[#5C736B] uppercase tracking-wider block">
                Last Optical Scan Time
              </span>
              <span className="text-sm font-bold text-[#17332B] font-tabular block mt-0.5">
                {captureTime}
              </span>
            </div>

            <div className="bg-[#F2F6F4] border border-[#E2EAE6] rounded-xl p-3.5">
              <span className="text-[10px] font-semibold text-[#5C736B] uppercase tracking-wider block">
                AI Detected Pattern
              </span>
              <span className="text-sm font-bold text-[#17332B] block mt-0.5 capitalize font-display">
                {prediction}
              </span>
            </div>

            <div className="bg-[#F2F6F4] border border-[#E2EAE6] rounded-xl p-3.5">
              <span className="text-[10px] font-semibold text-[#5C736B] uppercase tracking-wider block">
                Dominant Confidence
              </span>
              <span className="text-sm font-bold text-[#17332B] font-tabular block mt-0.5">
                {dominantProb > 0 ? `${fmt(dominantProb)}%` : '—'}
              </span>
            </div>
          </div>

          <div className="bg-[#F2F6F4] border border-[#E2EAE6] p-3 rounded-xl">
            <p className="text-[11px] text-[#5C736B] m-0 leading-relaxed">
              Foto dan data inferensi ditujukan untuk pemantauan dini kesehatan kanopi daun secara berkala.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
