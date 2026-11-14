import React from 'react';
import {
  LayoutDashboard,
  FileText,
  Newspaper,
  Archive,
  Settings,
  Sparkles,
  X,
} from 'lucide-react';

export type NavigationTab =
  | 'overview'
  | 'meeting-briefing'
  | 'news-intelligence'
  | 'research-vault'
  | 'settings';

interface SidebarProps {
  activeTab: NavigationTab;
  onNavigate: (tab: NavigationTab) => void;
  vaultCount: number;
  isOpenMobile: boolean;
  onToggleMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onNavigate,
  vaultCount,
  isOpenMobile,
  onToggleMobile,
}) => {
  const navItems: { id: NavigationTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'meeting-briefing', label: 'Meeting Briefing', icon: FileText },
    { id: 'news-intelligence', label: 'News Intelligence', icon: Newspaper },
    { id: 'research-vault', label: 'Research Vault', icon: Archive },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleSelect = (tab: NavigationTab) => {
    onNavigate(tab);
    if (isOpenMobile) onToggleMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
          onClick={onToggleMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0A1124] dark:bg-[#070c18] text-white flex flex-col justify-between border-r border-slate-800/80 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        } no-print`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <button
            onClick={() => handleSelect('overview')}
            className="flex items-center gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-950/50 shrink-0">
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white font-sans block leading-none">
                MeetBrief
              </span>
              <span className="text-xs text-slate-300 dark:text-slate-400 font-medium tracking-wide mt-1 block">
                Meeting Intelligence
              </span>
            </div>
          </button>

          {/* Close mobile button */}
          <button
            onClick={onToggleMobile}
            className="p-1.5 text-slate-300 hover:text-white lg:hidden cursor-pointer rounded-md"
            aria-label="Close navigation sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
          <div className="px-3 pb-2 text-xs font-semibold tracking-wider uppercase text-slate-300 dark:text-slate-400">
            Workspace
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-[15px] font-medium transition-colors cursor-pointer group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-900/30'
                    : 'text-slate-200 hover:text-white hover:bg-slate-800/80 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4.5 h-4.5 shrink-0 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.id === 'research-vault' && vaultCount > 0 && (
                  <span
                    className={`text-[13px] font-mono tabular-nums px-2 py-0.5 rounded ${
                      isActive ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-300 dark:text-slate-300'
                    }`}
                  >
                    {vaultCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer info badge */}
        <div className="p-4 border-t border-slate-800 text-xs space-y-2">
          <div className="p-3 bg-slate-800/60 dark:bg-slate-800/40 rounded-lg border border-slate-700/60 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-100">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Tavily & Multi-Provider AI</span>
            </div>
            <p className="text-[13px] text-slate-300 dark:text-slate-300 leading-relaxed">
              30-day verified intelligence strictly grounded in web evidence.
            </p>
          </div>
          <div className="text-xs text-slate-400 dark:text-slate-400 text-center font-mono pt-1">
            MeetBrief v2.0
          </div>
        </div>
      </aside>
    </>
  );
};
