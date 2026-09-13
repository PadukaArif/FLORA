import React, { useState } from 'react';
import { useToast } from './hooks/useToast';
import { useDashboard } from './hooks/useDashboard';
import { useScrollSpy } from './hooks/useScrollSpy';
import { useRelativeTime } from './hooks/useRelativeTime';
import { SplashScreen } from './components/experience/SplashScreen';
import { Plant3DExperience } from './components/experience/Plant3DExperience';
import { Sidebar } from './components/dashboard/Sidebar';
import { Header } from './components/dashboard/Header';
import { HeroOverview } from './components/dashboard/HeroOverview';
import { LiveMonitoring } from './components/dashboard/LiveMonitoring';
import { EnvironmentalAiRiskPanel } from './components/dashboard/EnvironmentalAiRiskPanel';
import { AiVisionPanel } from './components/dashboard/AiVisionPanel';
import { SmartWateringPanel } from './components/dashboard/SmartWateringPanel';
import { CameraCapturePanel } from './components/dashboard/CameraCapturePanel';
import { ManualDeviceControl } from './components/dashboard/ManualDeviceControl';
import { HistoryTrendsSection } from './components/dashboard/HistoryTrendsSection';
import { RecommendationPanel } from './components/dashboard/RecommendationPanel';
import { DailySummaryPanel } from './components/dashboard/DailySummaryPanel';
import { DeviceHealthSection } from './components/dashboard/DeviceHealthSection';
import { Footer } from './components/dashboard/Footer';
import { Toast } from './components/dashboard/Toast';

const sectionIds = [
  'overview',
  'monitoring',
  'analysis',
  'cameraCapture',
  'device-control',
  'treatment',
  'history',
  'devices',
];

export const App: React.FC = () => {
  const [expStage, setExpStage] = useState<'boot' | 'plant' | 'dashboard'>('boot');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const { message, visible, showToast } = useToast();
  const { data, systemState, refresh, recordWatering } = useDashboard(showToast);
  const activeSection = useScrollSpy(sectionIds, 140);
  const { relativeText, isStale } = useRelativeTime(data?.latest?.timestamp);

  const handleNavigate = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F7FAF8] text-[#17332B] flex flex-col">
      {/* 1. Splash Screen Boot Sequence - Fixed overlay, unmounted and deleted forever when finished */}
      {expStage === 'boot' && (
        <SplashScreen
          onBootComplete={() => setExpStage('dashboard')}
          onSkip={() => setExpStage('dashboard')}
        />
      )}

      {/* 2. 3D Intro Experience */}
      {expStage === 'plant' && (
        <Plant3DExperience
          onComplete={() => setExpStage('dashboard')}
          onSkip={() => setExpStage('dashboard')}
        />
      )}

      {/* 3. FLORA Main Dashboard - Rendered underneath so circle outro seamlessly reveals it */}
      {expStage !== 'plant' && (
        <div className="flex flex-1 min-h-screen">
          {/* Refined Sidebar */}
          <Sidebar
            systemState={systemState}
            activeSection={activeSection}
            onNavigate={handleNavigate}
            mobileOpen={mobileMenuOpen}
            onCloseMobile={() => setMobileMenuOpen(false)}
          />

          {/* Main Content Area */}
          <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-[1440px] mx-auto w-full">
            <Header
              onRefresh={refresh}
              onOpenMobileMenu={() => setMobileMenuOpen(true)}
              mqttStatus={data?.mqtt}
              isStale={isStale}
              lastTelemetryText={relativeText}
            />

            <div className="space-y-8">
              {/* 1. Overview */}
              <HeroOverview latest={data?.latest || null} />

              {/* 2. Live Telemetry with Interpretation */}
              <LiveMonitoring
                latest={data?.latest || null}
                config={data?.config}
              />

              {/* 3. Plant Intelligence (Environmental AI + AI Vision) */}
              <div
                className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch"
                id="analysis"
              >
                <EnvironmentalAiRiskPanel latest={data?.latest || null} />
                <AiVisionPanel latest={data?.latest || null} />
              </div>

              {/* 4. ESP32-CAM AI Vision Optical Capture */}
              <CameraCapturePanel latest={data?.latest || null} />

              {/* 5. Manual Scanner Carriage Control */}
              <ManualDeviceControl
                onToast={showToast}
                limitLeft={data?.latest?.limit_left}
                limitRight={data?.latest?.limit_right}
              />

              {/* 6. Treatment Advisory + Smart Watering */}
              <div
                className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch"
                id="treatment"
              >
                <RecommendationPanel latest={data?.latest || null} />
                <SmartWateringPanel
                  latest={data?.latest || null}
                  onWatered={recordWatering}
                />
              </div>

              {/* 7. Environmental Trends & Multi-Sensor Chart */}
              <HistoryTrendsSection
                history={data?.history || []}
                trends={data?.summary?.trends}
              />

              {/* 24-Hour Signal Summary */}
              <DailySummaryPanel summary={data?.summary} />

              {/* System & Hardware Topology */}
              <DeviceHealthSection
                latest={data?.latest || null}
                mqttStatus={data?.mqtt}
              />

              {/* Footer */}
              <Footer />
            </div>
          </main>

          {/* Non-blocking Notification Toast */}
          <Toast message={message} visible={visible} />
        </div>
      )}
    </div>
  );
};

export default App;
