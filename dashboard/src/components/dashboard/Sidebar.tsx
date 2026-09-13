import React from 'react';

interface SidebarProps {
  systemState: string;
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const navItems = [
  { id: 'overview', label: 'Overview', icon: '✦' },
  { id: 'monitoring', label: 'Monitoring', icon: '◎' },
  { id: 'analysis', label: 'AI Analysis', icon: '◈' },
  { id: 'cameraCapture', label: 'AI Vision', icon: '◒' },
  { id: 'device-control', label: 'Scanner Control', icon: '⇄' },
  { id: 'treatment', label: 'Treatment & Advice', icon: '☘' },
  { id: 'history', label: 'History & Trends', icon: '∿' },
  { id: 'devices', label: 'System Health', icon: '▣' },
];

export const Sidebar: React.FC<SidebarProps> = ({
  systemState,
  activeSection,
  onNavigate,
  mobileOpen,
  onCloseMobile,
}) => {
  const isOnline = systemState.toLowerCase().includes('active') || systemState.toLowerCase().includes('ready');

  const navContent = (
    <div className="flex flex-col h-full p-5 text-[#DCECE5]">
      {/* Brand Header */}
      <div className="flex items-center gap-3 pb-6 border-b border-[#235849]">
        <div className="w-9 h-9 rounded-lg bg-[#2F6F5E] text-[#DCECE5] flex items-center justify-center font-bold text-lg border border-[#58977F]/30 shadow-sm">
          F
        </div>
        <div>
          <div className="font-bold text-base tracking-wide text-white font-display">
            FLORA
          </div>
          <div className="text-[11px] text-[#8FBEA8] leading-tight font-medium">
            Smart Plant &amp; AI System
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <div className="my-5">
        <p className="text-[10px] font-semibold text-[#8FBEA8]/80 uppercase tracking-wider px-3 mb-2">
          Navigation
        </p>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(item.id);
                  onCloseMobile();
                }}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
                  isActive
                    ? 'bg-[#2F6F5E] text-white font-semibold shadow-sm'
                    : 'text-[#8FBEA8] hover:bg-[#1E5647] hover:text-white'
                }`}
              >
                <span className="text-xs opacity-75">{item.icon}</span>
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>
      </div>

      {/* System Health Summary at Bottom */}
      <div className="mt-auto pt-4 border-t border-[#235849]">
        <div className="bg-[#10352B] p-3 rounded-xl border border-[#235849] flex items-center gap-3">
          <span
            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
              isOnline ? 'bg-[#4ADE80] shadow-[0_0_8px_rgba(74,222,128,0.5)]' : 'bg-[#FBBF24]'
            }`}
          />
          <div className="min-w-0 flex-1">
            <span className="block text-[10px] text-[#8FBEA8] font-medium uppercase tracking-wider">
              System Channel
            </span>
            <span className="block text-xs font-semibold text-white truncate">
              {systemState}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Sticky, stays with page as content scrolls) */}
      <aside className="hidden lg:flex w-[240px] h-screen sticky top-0 shrink-0 bg-[#17483B] flex-col border-r border-[#235849] z-30">
        {navContent}
      </aside>

      {/* Mobile Drawer Backdrop & Menu */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden flex"
          onClick={onCloseMobile}
        >
          <div
            className="w-[260px] h-full bg-[#17483B] shadow-2xl flex flex-col z-50 animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b border-[#235849]">
              <span className="text-xs font-bold text-white uppercase tracking-wider font-display">
                FLORA Menu
              </span>
              <button
                onClick={onCloseMobile}
                className="text-[#8FBEA8] hover:text-white p-1 rounded-md text-sm"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {navContent}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
