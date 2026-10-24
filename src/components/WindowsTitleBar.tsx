import React from 'react';
import {
  Zap,
  Moon,
  Sun,
  ShieldCheck,
  History,
  Info,
  Layers,
  BarChart3,
  Table,
  Server,
  Radio,
  Download,
} from 'lucide-react';

interface WindowsTitleBarProps {
  darkMode: boolean;
  onToggleTheme: () => void;
  isFullscreenWindow?: boolean;
  onToggleFullscreen?: () => void;
  onOpenPortableModal: () => void;
  onOpenAboutModal: () => void;
  activeTab: 'benchmark' | 'visualize' | 'table' | 'history' | 'manager' | 'probe' | 'export';
  setActiveTab: (tab: 'benchmark' | 'visualize' | 'table' | 'history' | 'manager' | 'probe' | 'export') => void;
  onOpenSelectorModal?: () => void;
  selectedCount?: number;
}

export const WindowsTitleBar: React.FC<WindowsTitleBarProps> = ({
  darkMode,
  onToggleTheme,
  onOpenPortableModal,
  onOpenAboutModal,
  activeTab,
  setActiveTab,
  onOpenSelectorModal,
  selectedCount = 52,
}) => {
  // Detect if running inside the compiled Windows native desktop wrapper
  const isNativeApp =
    typeof window !== 'undefined' &&
    ((window as unknown as { __IS_NATIVE_DESKTOP__?: boolean }).__IS_NATIVE_DESKTOP__ === true ||
      window.location.search.includes('native=1') ||
      window.location.protocol === 'file:' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === 'localhost');

  return (
    <header className="relative flex flex-col select-none border-b border-neutral-200 dark:border-neutral-800 bg-neutral-100/95 dark:bg-neutral-900/95 backdrop-blur-md transition-colors z-20">
      {/* Native Desktop App Command & Navigation Bar */}
      <div className="flex items-center justify-between h-12 px-3 sm:px-4">
        {/* Left: App Identity & Developer Credit */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-600 text-white shadow-sm shadow-blue-500/30">
            <Zap className="w-4 h-4 fill-current" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-900 dark:text-neutral-100 tracking-tight text-sm">
              DNS SpeedBench
            </span>
            <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 font-semibold bg-neutral-200/60 dark:bg-neutral-800 px-1.5 py-0.5 rounded">
              v1.0
            </span>
            <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-medium text-neutral-600 dark:text-neutral-300 bg-neutral-200/50 dark:bg-neutral-800/80 px-2 py-0.5 rounded">
              by <strong className="text-neutral-900 dark:text-neutral-100 font-semibold">Rohith Varma</strong>
            </span>
            {isNativeApp ? (
              <span className="hidden xl:inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Native Desktop Utility
              </span>
            ) : (
              <span className="hidden xl:inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                <ShieldCheck className="w-3 h-3" />
                Standalone Utility
              </span>
            )}
          </div>
        </div>

        {/* Center: Primary Navigation Tabs */}
        <nav className="flex items-center gap-1 p-1 bg-neutral-200/60 dark:bg-neutral-800/70 rounded-lg text-xs font-medium max-w-full overflow-x-auto mx-2">
          <button
            onClick={() => setActiveTab('benchmark')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
              activeTab === 'benchmark'
                ? 'bg-white dark:bg-neutral-700 text-blue-600 dark:text-white shadow-sm font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-neutral-700/50'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Benchmark</span>
          </button>

          <button
            onClick={() => setActiveTab('visualize')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
              activeTab === 'visualize'
                ? 'bg-white dark:bg-neutral-700 text-blue-600 dark:text-white shadow-sm font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-neutral-700/50'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Visual Charts</span>
          </button>

          <button
            onClick={() => setActiveTab('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
              activeTab === 'table'
                ? 'bg-white dark:bg-neutral-700 text-blue-600 dark:text-white shadow-sm font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-neutral-700/50'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Detailed Metrics</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
              activeTab === 'history'
                ? 'bg-white dark:bg-neutral-700 text-blue-600 dark:text-white shadow-sm font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-neutral-700/50'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">History</span>
          </button>

          <button
            onClick={() => setActiveTab('manager')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
              activeTab === 'manager'
                ? 'bg-white dark:bg-neutral-700 text-blue-600 dark:text-white shadow-sm font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-neutral-700/50'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span className="hidden md:inline">DNS Servers</span>
          </button>

          <button
            onClick={() => setActiveTab('probe')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
              activeTab === 'probe'
                ? 'bg-white dark:bg-neutral-700 text-blue-600 dark:text-white shadow-sm font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-neutral-700/50'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Live Probe</span>
          </button>

          {!isNativeApp && (
            <button
              onClick={() => setActiveTab('export')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
                activeTab === 'export'
                  ? 'bg-white dark:bg-neutral-700 text-blue-600 dark:text-white shadow-sm font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-neutral-700/50'
              }`}
            >
              <Download className="w-3.5 h-3.5 text-blue-500" />
              <span>Portable .exe</span>
            </button>
          )}
        </nav>

        {/* Right: Actions, Selector, Theme, About */}
        <div className="flex items-center gap-2 shrink-0">
          {onOpenSelectorModal && (
            <button
              onClick={onOpenSelectorModal}
              title="Select which DNS resolvers to benchmark"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-md border border-blue-200 dark:border-blue-800 transition-colors"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Resolvers</span>
              <span className="font-mono text-[11px] bg-blue-200/80 dark:bg-blue-800/90 px-1.5 py-0.2 rounded font-bold">
                {selectedCount}
              </span>
            </button>
          )}

          {!isNativeApp && (
            <button
              onClick={onOpenPortableModal}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-md border border-emerald-200 dark:border-emerald-800 transition-colors"
              title="Download standalone Windows portable executable"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Get .exe</span>
            </button>
          )}

          {/* Quick Theme Switch */}
          <button
            onClick={onToggleTheme}
            title={darkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            className="flex items-center justify-center w-8 h-8 rounded-md text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/70 dark:hover:bg-neutral-800 transition-colors"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* About Dialog Button */}
          <button
            onClick={onOpenAboutModal}
            title="About DNS SpeedBench v1.0 by Rohith Varma"
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/70 dark:hover:bg-neutral-800 rounded-md transition-colors"
          >
            <Info className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">About</span>
          </button>
        </div>
      </div>
    </header>
  );
};
