import React from 'react';

interface SidebarProps {
  systemState: string;
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const navItems = [
  {
    id: 'overview',
    label: 'Overview',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    id: 'monitoring',
    label: 'Monitoring',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
  {
    id: 'analysis',
    label: 'AI Analysis',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  {
    id: 'cameraCapture',
    label: 'AI Vision',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
      </svg>
    ),
  },
  {
    id: 'device-control',
    label: 'Scanner Control',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 3 21 3 21 8" />
        <line x1="4" y1="20" x2="21" y2="3" />
        <polyline points="21 16 21 21 16 21" />
        <line x1="15" y1="15" x2="21" y2="21" />
        <line x1="4" y1="4" x2="9" y2="9" />
      </svg>
    ),
  },
  {
    id: 'treatment',
    label: 'Treatment & Advice',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a9 9 0 0 1 9 9c0 5-4 9-9 9s-9-4-9-9a9 9 0 0 1 9-9z" />
        <path d="M12 6v12M8 10l4-4 4 4" />
      </svg>
    ),
  },
  {
    id: 'history',
    label: 'History & Trends',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    id: 'devices',
    label: 'System Health',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
        <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
        <line x1="6" y1="6" x2="6.01" y2="6" />
        <line x1="6" y1="18" x2="6.01" y2="18" />
      </svg>
    ),
  },
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
    <div className="flex flex-col h-full p-4 lg:p-5 text-[#F0F4E8]">
      {/* Brand Header with Signature Botanical Star */}
      <div className="flex items-center gap-3 pb-5 border-b border-[#2C3B0E]">
        <div className="w-9 h-9 rounded-xl bg-[#597C00] text-white flex items-center justify-center border border-[#9DB312]/40 shadow-sm shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0 C12 7 17 12 24 12 C17 12 12 17 12 24 C12 17 7 12 0 12 C7 12 12 7 12 0 Z" />
          </svg>
        </div>
        <div className="min-w-0">
          <div className="font-bold text-[15px] tracking-wide text-white font-display leading-tight flex items-center gap-1.5">
            <span>FLORA</span>
          </div>
          <div className="text-[11px] text-[#C3D883] leading-tight font-medium mt-0.5 truncate">
            Botanical Intelligence
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <div className="my-5 flex-1 overflow-y-auto">
        <p className="text-[10px] font-bold text-[#9DB312]/80 uppercase tracking-widest px-3 mb-2.5">
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
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 relative ${
                  isActive
                    ? 'bg-[#597C00] text-white font-semibold shadow-xs'
                    : 'text-[#C3D883] hover:bg-[#2A3B0B] hover:text-white'
                }`}
              >
                <span className={`shrink-0 transition-opacity ${isActive ? 'opacity-100 text-white' : 'opacity-75'}`}>
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9DB312] ml-auto shrink-0 shadow-[0_0_6px_rgba(157,179,18,0.8)]" />
                )}
              </a>
            );
          })}
        </nav>
      </div>

      {/* System Health Summary at Bottom */}
      <div className="pt-4 border-t border-[#2C3B0E] shrink-0">
        <div className="bg-[#141D04] p-3 rounded-xl border border-[#2C3B0E] flex items-center gap-2.5">
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              isOnline ? 'bg-[#9DB312] shadow-[0_0_6px_rgba(157,179,18,0.7)]' : 'bg-[#D97706]'
            }`}
          />
          <div className="min-w-0 flex-1">
            <span className="block text-[9px] text-[#C3D883] font-semibold uppercase tracking-wider">
              System Channel
            </span>
            <span className="block text-xs font-semibold text-white truncate mt-0.5">
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
      <aside className="hidden lg:flex w-[240px] h-screen sticky top-0 shrink-0 bg-[#1E2805] flex-col border-r border-[#2C3B0E] z-30 shadow-md">
        {navContent}
      </aside>

      {/* Mobile Drawer Backdrop & Menu */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden flex"
          onClick={onCloseMobile}
        >
          <div
            className="w-[260px] h-full bg-[#1E2805] shadow-2xl flex flex-col z-50 animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b border-[#2C3B0E]">
              <span className="text-xs font-bold text-white uppercase tracking-wider font-display flex items-center gap-1.5">
                <span className="text-[#9DB312]">✦</span>
                <span>FLORA Menu</span>
              </span>
              <button
                onClick={onCloseMobile}
                className="text-[#C3D883] hover:text-white p-1 rounded-md text-sm"
                aria-label="Close navigation"
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
